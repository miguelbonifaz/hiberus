<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/orders', name: 'api_orders_')]
class OrderController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private OrderRepository $orderRepo,
        private ProductRepository $productRepo,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $customerId = $request->attributes->get('simulated_user_id');
        $data = json_decode($request->getContent(), true);

        if (empty($data['items'])) {
            return new JsonResponse(['error' => 'Order must have at least one item.'], Response::HTTP_BAD_REQUEST);
        }

        $order = new Order;
        $order->setCustomerId($customerId);

        $this->em->beginTransaction();
        try {
            foreach ($data['items'] as $itemData) {
                $product = $this->em->find(Product::class, $itemData['productId'] ?? 0, LockMode::PESSIMISTIC_WRITE);
                if (! $product) {
                    $this->em->rollback();

                    return new JsonResponse(['error' => sprintf('Product %d not found.', $itemData['productId'] ?? 0)], Response::HTTP_NOT_FOUND);
                }

                $quantity = $itemData['quantity'] ?? 0;
                if ($quantity <= 0) {
                    $this->em->rollback();

                    return new JsonResponse(['error' => 'Quantity must be greater than 0.'], Response::HTTP_BAD_REQUEST);
                }

                if ($product->getStock() < $quantity) {
                    $this->em->rollback();

                    return new JsonResponse(['error' => sprintf('Insufficient stock for product "%s". Available: %d', $product->getName(), $product->getStock())], Response::HTTP_BAD_REQUEST);
                }

                $orderItem = new OrderItem;
                $orderItem->setProduct($product);
                $orderItem->setQuantity($quantity);
                $orderItem->setUnitPrice($product->getPrice());
                $order->addItem($orderItem);

                $product->setStock($product->getStock() - $quantity);
            }

            $order->recalculateTotal();

            $errors = $this->validator->validate($order);
            if (count($errors) > 0) {
                $this->em->rollback();
                $violations = [];
                foreach ($errors as $error) {
                    $violations[$error->getPropertyPath()] = $error->getMessage();
                }

                return new JsonResponse(['errors' => $violations], Response::HTTP_BAD_REQUEST);
            }

            $this->em->persist($order);
            $this->em->flush();
            $this->em->commit();
        } catch (\Throwable $e) {
            $this->em->rollback();
            throw $e;
        }

        return new JsonResponse($order->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id, Request $request): JsonResponse
    {
        $customerId = $request->attributes->get('simulated_user_id');
        $order = $this->orderRepo->find($id);

        if (! $order) {
            return new JsonResponse(['error' => 'Order not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getCustomerId() !== $customerId) {
            return new JsonResponse(['error' => 'Access denied. This order does not belong to you.'], Response::HTTP_FORBIDDEN);
        }

        return new JsonResponse($order->toArray());
    }

    #[Route('/{id}/checkout', name: 'checkout', methods: ['POST'])]
    public function checkout(int $id, Request $request): JsonResponse
    {
        $customerId = $request->attributes->get('simulated_user_id');
        $order = $this->orderRepo->find($id);

        if (! $order) {
            return new JsonResponse(['error' => 'Order not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getCustomerId() !== $customerId) {
            return new JsonResponse(['error' => 'Access denied. This order does not belong to you.'], Response::HTTP_FORBIDDEN);
        }

        if ($order->getStatus() !== Order::STATUS_PENDING) {
            return new JsonResponse(['error' => sprintf('Order cannot be checked out. Current status: %s', $order->getStatus())], Response::HTTP_BAD_REQUEST);
        }

        $forceFail = $request->headers->get('X-Force-Fail', false);
        $paymentSuccess = !$forceFail && rand(1, 10) > 2;

        if ($paymentSuccess) {
            $order->setStatus(Order::STATUS_PAID);
            $order->setPaidAt(new \DateTimeImmutable);
            $this->em->flush();

            return new JsonResponse([
                'message' => 'Payment successful.',
                'order' => $order->toArray(),
            ]);
        }

        $order->setStatus(Order::STATUS_FAILED);
        foreach ($order->getItems() as $item) {
            $product = $item->getProduct();
            $product->setStock($product->getStock() + $item->getQuantity());
        }
        $this->em->flush();

        return new JsonResponse([
            'message' => 'Payment failed. Please try again.',
            'order' => $order->toArray(),
        ], Response::HTTP_PAYMENT_REQUIRED);
    }
}
