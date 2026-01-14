"""
URL configuration for SpeakUp project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from django.views.generic import TemplateView
from django.contrib.sitemaps.views import sitemap
from apps.core.sitemaps import SpeakUpSitemap, NewsSitemap
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

# Sitemap config
sitemaps = {
    'static': SpeakUpSitemap,
    'news': NewsSitemap,
}

# Healthcheck endpoint (before i18n patterns to avoid language prefix)
def healthcheck(request):
    """Simple healthcheck endpoint for Render deployment."""
    return HttpResponse('OK', content_type='text/plain', status=200)

# Non-i18n URLs (без мовного префіксу)
urlpatterns = [
    path('healthz', healthcheck, name='healthcheck'),
    path('admin/', admin.site.urls),
    path('robots.txt', TemplateView.as_view(
        template_name='robots.txt',
        content_type='text/plain',
        extra_context={'debug': settings.DEBUG}
    ), name='robots_txt'),
    path('googleeb817bc37494f0e8.html', TemplateView.as_view(
        template_name='googleeb817bc37494f0e8.html',
        content_type='text/html'
    ), name='google_verification'),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
]

# i18n URLs (UK без префіксу, RU з /ru/)
urlpatterns += i18n_patterns(
    path('', include('apps.core.urls')),
    path('leads/', include('apps.leads.urls')),
    prefix_default_language=False,  # UK без префіксу
)

# Static/media files для DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Використовуємо першу директорію з STATICFILES_DIRS для розробки
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()

