<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function findPaginated(string $search = '', int $page = 1, int $limit = 10, string $sort = 'id', string $direction = 'ASC'): array
    {
        $qb = $this->createQueryBuilder('p');

        if ($search !== '') {
            $qb->andWhere('p.name LIKE :search OR p.description LIKE :search OR p.category LIKE :search')
                ->setParameter('search', '%'.$search.'%');
        }

        $allowedSorts = ['id', 'name', 'price', 'stock', 'category', 'createdAt'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        $direction = strtoupper($direction) === 'DESC' ? 'DESC' : 'ASC';

        $qb->orderBy('p.'.$sort, $direction);

        $total = (clone $qb)->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        return [
            'items' => $qb->getQuery()->getResult(),
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ];
    }
}
