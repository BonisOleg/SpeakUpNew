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

# WhiteNoise configuration for static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

