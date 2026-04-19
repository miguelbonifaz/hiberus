<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
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
            return $this->json(['error' => 'Order must have at least one item.'], Response::HTTP_BAD_REQUEST);
        }

        $order = new Order;
        $order->setCustomerId($customerId);

        foreach ($data['items'] as $itemData) {
            $product = $this->productRepo->find($itemData['productId'] ?? 0);
            if (! $product) {
                return $this->json(['error' => sprintf('Product %d not found.', $itemData['productId'] ?? 0)], Response::HTTP_NOT_FOUND);
            }

            $quantity = $itemData['quantity'] ?? 0;
            if ($quantity <= 0) {
                return $this->json(['error' => 'Quantity must be greater than 0.'], Response::HTTP_BAD_REQUEST);
            }

            if ($product->getStock() < $quantity) {
                return $this->json(['error' => sprintf('Insufficient stock for product "%s". Available: %d', $product->getName(), $product->getStock())], Response::HTTP_BAD_REQUEST);
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
            $violations = [];
            foreach ($errors as $error) {
                $violations[$error->getPropertyPath()] = $error->getMessage();
            }

            return $this->json(['errors' => $violations], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($order);
        $this->em->flush();

        return $this->json($order, Response::HTTP_CREATED, [], ['groups' => 'order:read']);
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(int $id, Request $request): JsonResponse
    {
        $customerId = $request->attributes->get('simulated_user_id');
        $order = $this->orderRepo->find($id);

        if (! $order) {
            return $this->json(['error' => 'Order not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getCustomerId() !== $customerId) {
            return $this->json(['error' => 'Access denied. This order does not belong to you.'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($order, Response::HTTP_OK, [], ['groups' => 'order:read']);
    }

    #[Route('/{id}/checkout', name: 'checkout', methods: ['POST'])]
    public function checkout(int $id, Request $request): JsonResponse
    {
        $customerId = $request->attributes->get('simulated_user_id');
        $order = $this->orderRepo->find($id);

        if (! $order) {
            return $this->json(['error' => 'Order not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getCustomerId() !== $customerId) {
            return $this->json(['error' => 'Access denied. This order does not belong to you.'], Response::HTTP_FORBIDDEN);
        }

        if ($order->getStatus() !== Order::STATUS_PENDING) {
            return $this->json(['error' => sprintf('Order cannot be checked out. Current status: %s', $order->getStatus())], Response::HTTP_BAD_REQUEST);
        }

        $paymentSuccess = rand(1, 10) > 2;

        if ($paymentSuccess) {
            $order->setStatus(Order::STATUS_PAID);
            $order->setPaidAt(new \DateTimeImmutable);
            $this->em->flush();

            return $this->json(['message' => 'Payment successful.', 'order' => $order], Response::HTTP_OK, [], ['groups' => 'order:read']);
        }

        $order->setStatus(Order::STATUS_FAILED);
        $this->em->flush();

        return $this->json(['message' => 'Payment failed. Please try again.', 'order' => $order], Response::HTTP_PAYMENT_REQUIRED, [], ['groups' => 'order:read']);
    }
}
