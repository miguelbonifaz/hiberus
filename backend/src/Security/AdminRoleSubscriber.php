<?php

namespace App\Security;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class AdminRoleSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 5]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if (! str_starts_with($path, '/api/')) {
            return;
        }

        if ($path === '/api/products' && $request->isMethod('POST')) {
            $role = $request->attributes->get('simulated_user_role');
            if ($role !== 'ADMIN') {
                $event->setResponse(new JsonResponse(['error' => 'Access denied. Admin role required.'], 403));
            }
        }
    }
}
