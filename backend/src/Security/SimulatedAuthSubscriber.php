<?php

namespace App\Security;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SimulatedAuthSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 10]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if (! str_starts_with($path, '/api/')) {
            return;
        }

        $userId = $request->headers->get('X-User-Id');
        $userRole = $request->headers->get('X-User-Role');

        if ($userId && $userRole) {
            $request->attributes->set('simulated_user_id', (int) $userId);
            $request->attributes->set('simulated_user_role', $userRole);

            return;
        }

        $excludedPaths = ['/api/products'];
        if (in_array($path, $excludedPaths) && $request->isMethod('GET')) {
            return;
        }

        $event->setResponse(new JsonResponse(['error' => 'Authentication required. Provide X-User-Id and X-User-Role headers.'], 401));
    }
}
