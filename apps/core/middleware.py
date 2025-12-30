"""
Middleware для обробки 301 редиректів зі старих URL.
"""
from django.shortcuts import redirect
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.conf import settings
from .models import NewsArticle
from .redirects import REDIRECTS


class AllowedHostsMiddleware:
    """
    Middleware для обробки ALLOWED_HOSTS.
    Автоматично дозволяє всі хости, якщо ALLOWED_HOSTS не налаштований або містить '*'.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def process_request(self, request):
        """
        process_request викликається ДО SecurityMiddleware.process_request,
        що дозволяє нам модифікувати ALLOWED_HOSTS перед перевіркою.
        """
        allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])

        # Якщо ALLOWED_HOSTS порожній або містить '*', дозволяємо всі хости
        allow_all = not allowed_hosts or '*' in allowed_hosts

        if allow_all:
            try:
                host = request.get_host().split(':')[0]  # Без порту
                # Додаємо хост до ALLOWED_HOSTS динамічно
                if host not in settings.ALLOWED_HOSTS:
                    settings.ALLOWED_HOSTS.append(host)
            except Exception:
                # Якщо не можемо отримати хост, не блокуємо запит
                pass

        return None  # None означає "продовжити обробку"

    def __call__(self, request):
        response = self.get_response(request)
        return response


class HealthCheckMiddleware:
    """
    Middleware для обробки healthcheck запитів від Render.
    Обробляє запити до / та /healthz до перевірки ALLOWED_HOSTS.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Перевірка чи це healthcheck від Render
        is_render_healthcheck = (
            user_agent.startswith('Render/') or
            user_agent.startswith('Go-http-client/') or
            request.META.get('REMOTE_ADDR', '').startswith('10.228.')
        )

        # Обробка healthcheck запитів
        if is_render_healthcheck and (path == '/' or path == '/healthz'):
            return HttpResponse('OK', content_type='text/plain', status=200)

        response = self.get_response(request)
        return response


class NewsRedirectMiddleware:
    """
    Middleware для автоматичних 301 редиректів зі старих news URL та інших старих URL.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Перевірка статичних редиректів
        if path in REDIRECTS:
            new_url = REDIRECTS[path]
            return redirect(new_url, permanent=True)

        # Перевірка чи це старий news URL
        if path.startswith('/news/') and path != '/news/':
            # Шукаємо статтю за old_url_uk або old_url_ru
            article = NewsArticle.objects.filter(
                old_url_uk=path
            ).first()

            if not article:
                article = NewsArticle.objects.filter(
                    old_url_ru=path
                ).first()

            if article:
                # 301 редирект на новий URL ТІЛЬКИ якщо URL відрізняється
                new_url = article.get_absolute_url()
                if new_url != path:
                    return redirect(new_url, permanent=True)

        response = self.get_response(request)
        return response




