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

        $result = $this->productRepo->findPaginated($search, $page, 10, $sort, $direction);

        return $this->json([
            'items' => $result['items'],
            'total' => $result['total'],
            'page' => $result['page'],
            'limit' => $result['limit'],
        ], Response::HTTP_OK, [], ['groups' => 'product:read']);
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

            return $this->json(['errors' => $violations], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($product);
        $this->em->flush();

        return $this->json($product, Response::HTTP_CREATED, [], ['groups' => 'product:read']);
    }
}
