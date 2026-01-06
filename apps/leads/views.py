import logging
from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from .forms import TrialLessonForm
from .utils import send_trial_confirmation_email, get_client_ip

logger = logging.getLogger(__name__)


@require_http_methods(["POST"])
@csrf_protect
def submit_trial_form(request):
    """API endpoint для відправки форми запису на пробний урок"""
    logger.info('[TrialForm] Received POST request')
    logger.debug('[TrialForm] POST data: %s', dict(request.POST))
    logger.debug('[TrialForm] CSRF token in headers: %s', request.headers.get('X-CSRFToken', 'not found'))
    logger.debug('[TrialForm] CSRF token in POST: %s', request.POST.get('csrfmiddlewaretoken', 'not found'))

    # Перевірка CSRF (якщо декоратор не спрацював, це вже буде 403)
    # Але ми можемо додати додаткову перевірку для кращого логування
    try:
        form = TrialLessonForm(request.POST)
    except Exception as e:
        logger.error('[TrialForm] Error creating form: %s', e, exc_info=True)
        return JsonResponse({
            'success': False,
            'errors': {'__all__': ['Помилка обробки форми. Спробуйте ще раз.']}
        }, status=400)

    if form.is_valid():
        logger.info('[TrialForm] Form is valid, processing...')
        try:
            lead = form.save(commit=False)

            # UTM та реклама:
            lead.utm_source = request.POST.get('utm_source', '')
            lead.utm_medium = request.POST.get('utm_medium', '')
            lead.utm_campaign = request.POST.get('utm_campaign', '')
            lead.utm_content = request.POST.get('utm_content', '')
            lead.utm_term = request.POST.get('utm_term', '')
            lead.fbclid = request.POST.get('fbclid', '')
            lead.gclid = request.POST.get('gclid', '')
            lead.referrer = request.META.get('HTTP_REFERER', '')
            lead.ip_address = get_client_ip(request)

            lead.save()
            logger.info('[TrialForm] Lead saved successfully: %s - %s', lead.name, lead.phone)

            # Відправити email (не критично, якщо не вдасться):
            try:
                send_trial_confirmation_email(lead, request)
                logger.info('[TrialForm] Email sent successfully')
            except Exception as email_error:
                logger.error('[TrialForm] Email sending failed: %s', email_error, exc_info=True)
                # Не блокуємо успішну відправку форми

            # TODO: Telegram notification (заглушка)

            logger.info('[TrialForm] Request processed successfully')
            # Використовуємо Django URL reverse для правильного URL
            redirect_url = reverse('core:testing')
            return JsonResponse({
                'success': True,
                'redirect_url': redirect_url,
                'message': 'Дякуємо! Перенаправляємо вас на тест.'
            })
        except Exception as e:
            logger.error('[TrialForm] Unexpected error during processing: %s', e, exc_info=True)
            return JsonResponse({
                'success': False,
                'errors': {'__all__': ['Помилка сервера. Спробуйте ще раз.']}
            }, status=500)
    else:
        logger.warning('[TrialForm] Form validation failed: %s', form.errors)
        return JsonResponse({
            'success': False,
            'errors': form.errors
        }, status=400)





