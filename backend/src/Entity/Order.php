<?php

namespace App\Entity;

use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: 'orders')]
class Order
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $customerId = null;

    #[ORM\Column(length: 20)]
    private ?string $status = self::STATUS_PENDING;

    #[ORM\Column]
    private ?float $total = 0;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $paidAt = null;

    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItem::class, cascade: ['persist'])]
    private Collection $items;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable;
        $this->items = new ArrayCollection;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCustomerId(): ?int
    {
        return $this->customerId;
    }

    public function setCustomerId(int $customerId): static
    {
        $this->customerId = $customerId;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getTotal(): ?float
    {
        return $this->total;
    }

    public function setTotal(float $total): static
    {
        $this->total = $total;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getPaidAt(): ?\DateTimeImmutable
    {
        return $this->paidAt;
    }

    public function setPaidAt(?\DateTimeImmutable $paidAt): static
    {
        $this->paidAt = $paidAt;

        return $this;
    }

    /** @return Collection<int, OrderItem> */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(OrderItem $item): static
    {
        if (! $this->items->contains($item)) {
            $this->items->add($item);
            $item->setOrder($this);
        }

        return $this;
    }

    public function recalculateTotal(): static
    {
        $this->total = array_reduce(
            $this->items->toArray(),
            fn (float $carry, OrderItem $item) => $carry + ($item->getUnitPrice() * $item->getQuantity()),
            0.0
        );

        return $this;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'customerId' => $this->customerId,
            'status' => $this->status,
            'total' => $this->total,
            'items' => $this->items->map(fn (OrderItem $item) => $item->toArray())->toArray(),
            'createdAt' => $this->createdAt?->format('c'),
            'paidAt' => $this->paidAt?->format('c'),
        ];
    }
}
