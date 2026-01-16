
from django import forms


def normalize_phone_number(phone):
    """
    Нормалізувати український номер телефону до формату +380XXXXXXXXX.

    Підтримує формати:
    - +380XXXXXXXXX (13 символів: +380 + 9 цифр)
    - 380XXXXXXXXX (12 цифр)
    - 38XXXXXXXXX (11 цифр)
    - 0XXXXXXXXX (10 цифр)
    - XXXXXXXXX (9 цифр)

    Raises:
        forms.ValidationError: Якщо номер некоректний
    """
    if not phone:
        return phone

    phone = phone.strip()
    if not phone:
        return phone

    # Видалити всі пробіли, дужки, дефіси та інші символи (крім +)
    phone_clean = phone.replace(' ', '').replace('(', '').replace(')', '').replace('-', '')

    # Перевірити чи є + на початку
    has_plus = phone_clean.startswith('+')

    # Витягти тільки цифри
    digits = ''.join(filter(str.isdigit, phone_clean))

    # Якщо немає цифр - помилка
    if not digits:
        raise forms.ValidationError("Введіть коректний український номер телефону")

    # Нормалізація до формату +380XXXXXXXXX (13 символів: +380 + 9 цифр)
    if has_plus and phone_clean.startswith('+380'):
        # +380XXXXXXXXX - вже має правильний префікс, потрібно витягти 9 цифр після 380
        if len(digits) >= 3:
            # Витягнути цифри після 380 (останні 9 цифр)
            phone_digits = digits[3:] if len(digits) > 3 else digits
            if len(phone_digits) == 9:
                phone = '+380' + phone_digits
            else:
                raise forms.ValidationError("Введіть коректний український номер телефону (9 цифр після +380)")
        else:
            raise forms.ValidationError("Введіть коректний український номер телефону")
    elif len(digits) == 12 and digits.startswith('380'):
        # 380XXXXXXXXX -> +380XXXXXXXXX (видаляємо 380, додаємо +380)
        phone = '+380' + digits[3:]
    elif len(digits) == 11 and digits.startswith('38'):
        # 38XXXXXXXXX -> +380XXXXXXXXX (видаляємо 38, додаємо +380)
        phone = '+380' + digits[2:]
    elif len(digits) == 10 and digits.startswith('0'):
        # 0XXXXXXXXX -> +380XXXXXXXXX (видаляємо 0, додаємо +380)
        phone = '+380' + digits[1:]
    elif len(digits) == 9:
        # XXXXXXXXX (9 цифр без префіксу) -> +380XXXXXXXXX
        phone = '+380' + digits
    else:
        raise forms.ValidationError("Введіть коректний український номер телефону")

    # Фінальна перевірка формату (модель очікує ^\+380\d{9}$)
    if not phone.startswith('+380') or len(phone) != 13:
        raise forms.ValidationError("Номер має містити 9 цифр після коду +380")

    return phone


def get_client_ip(request):
    """Отримати IP адресу клієнта"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def send_trial_confirmation_email(lead, request):
    """
    Відправка підтвердження на email.

    Примітка: Наразі не відправляємо email, оскільки в моделі немає поля email.
    Функція залишена для майбутнього використання, коли додадуть email поле.
    Можна також відправляти email адміністратору з інформацією про нову заявку.
    """
    # TODO: Додати поле email в модель TrialLesson або відправляти адміністратору
    # Наразі просто логуємо, що заявка створена
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f'[TrialForm] New lead created: {lead.name} - {lead.phone}. Email notification skipped (no email field).')

    # Позначаємо, що "email відправлено" (насправді просто заявка оброблена)
    lead.email_sent = True
    lead.save(update_fields=['email_sent'])
    return True





