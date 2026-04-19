<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/products', name: 'api_products_')]
class ProductController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ProductRepository $productRepo,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $search = $request->query->get('search', '');
        $page = max(1, (int) $request->query->get('page', 1));
        $sort = $request->query->get('sort', 'id');
        $direction = $request->query->get('direction', 'ASC');
        $category = $request->query->get('category', '');

        $result = $this->productRepo->findPaginated($search, $page, 10, $sort, $direction, $category);

        return new JsonResponse([
            'items' => array_map(fn (Product $p) => $p->toArray(), $result['items']),
            'total' => $result['total'],
            'page' => $result['page'],
            'limit' => $result['limit'],
        ]);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(int $id): JsonResponse
    {
        $product = $this->productRepo->find($id);
        if (! $product) {
            return new JsonResponse(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($product->toArray());
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $product = new Product;
        $product->setName($data['name'] ?? '');
        $product->setDescription($data['description'] ?? null);
        $product->setPrice($data['price'] ?? 0);
        $product->setStock($data['stock'] ?? 0);
        $product->setCategory($data['category'] ?? '');

        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            $violations = [];
            foreach ($errors as $error) {
                $violations[$error->getPropertyPath()] = $error->getMessage();
            }

            return new JsonResponse(['errors' => $violations], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($product);
        $this->em->flush();

        return new JsonResponse($product->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $product = $this->productRepo->find($id);
        if (! $product) {
            return new JsonResponse(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $product->setName($data['name']);
        }
        if (array_key_exists('description', $data)) {
            $product->setDescription($data['description'] ?? null);
        }
        if (isset($data['price'])) {
            $product->setPrice($data['price']);
        }
        if (isset($data['stock'])) {
            $product->setStock($data['stock']);
        }
        if (isset($data['category'])) {
            $product->setCategory($data['category']);
        }

        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            $violations = [];
            foreach ($errors as $error) {
                $violations[$error->getPropertyPath()] = $error->getMessage();
            }

            return new JsonResponse(['errors' => $violations], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return new JsonResponse($product->toArray());
    }
}
