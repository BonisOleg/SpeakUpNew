"""
Production settings for SpeakUp project.
"""
from .base import *
import dj_database_url

DEBUG = False

# Allowed hosts - filter out empty strings
# Fallback to ['*'] if not set (for Render healthcheck and initial deployment)
# '*' не працює як wildcard в Django, тому middleware обробляє це автоматично
allowed_hosts_env = os.getenv('ALLOWED_HOSTS', '').strip()
if allowed_hosts_env:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
else:
    # Якщо не встановлено, дозволяємо всі хости через middleware
    ALLOWED_HOSTS = ['*']  # Middleware обробляє '*' як "дозволити всі"

# CSRF trusted origins - filter out empty strings
CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()
]
# Add https:// prefix if not present
CSRF_TRUSTED_ORIGINS = [
    origin if origin.startswith('http') else f'https://{origin}'
    for origin in CSRF_TRUSTED_ORIGINS
]

# Database
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', ''),
            'USER': os.getenv('DB_USER', ''),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# Security settings for production
# SECURE_SSL_REDIRECT enabled - healthcheck обробляється через HealthCheckMiddleware
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# SEO: Canonical domain для robots.txt та інших цілей
# Повинна бути встановлена в .env або використовується перший ALLOWED_HOST
CANONICAL_DOMAIN = os.getenv('CANONICAL_DOMAIN', '')
if not CANONICAL_DOMAIN and ALLOWED_HOSTS and ALLOWED_HOSTS[0] != '*':
    CANONICAL_DOMAIN = f"https://{ALLOWED_HOSTS[0]}"

# WhiteNoise configuration for static files (БЕЗ кешування)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
WHITENOISE_BROTLI_ENABLED = True
WHITENOISE_MAX_AGE = 0  # Без кешування
WHITENOISE_MIMETYPES = {
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml; charset=utf-8',
}

# Logging configuration for production (console instead of file)
# На Render немає директорії logs, тому використовуємо console handler
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        'apps.core.utils.redirect_logger': {
            'handlers': ['console'],
            'level': 'ERROR',
        },
    },
}
