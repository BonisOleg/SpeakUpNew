from django import forms
from .models import TrialLesson
from .utils import normalize_phone_number
import logging

logger = logging.getLogger(__name__)


class TrialLessonForm(forms.ModelForm):
    # Honeypot поле - НЕЗВИЧНА назва щоб браузер НЕ автозаповнював
    # "contact_me_by_fax_only" - назва яку браузери не розпізнають
    contact_me_by_fax_only = forms.CharField(
        required=False,
        label='',  # Без label щоб не привертати увагу
        widget=forms.TextInput(attrs={
            'tabindex': '-1',
            'autocomplete': 'new-password',  # Обманюємо Chrome
            'class': 'form-group__input--honeypot',
            'aria-hidden': 'true'
        })
    )

    class Meta:
        model = TrialLesson
        fields = ['name', 'phone']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': "Ім'я",
                'class': 'form-group__input',
                'required': True,
            }),
            'phone': forms.TextInput(attrs={
                'placeholder': '+380',
                'class': 'form-group__input',
                'type': 'tel',
                'inputmode': 'tel',
                'required': True,
            }),
        }

    def clean_name(self):
        """Валідація імені: мінімум 2 символи"""
        name = self.cleaned_data.get('name', '').strip()
        if name and len(name) < 2:
            raise forms.ValidationError("Ім'я має містити мінімум 2 символи")
        return name

    def clean_phone(self):
        """Нормалізувати телефон до +380XXXXXXXXX (формат моделі: ^\+380\d{9}$)"""
        phone = self.cleaned_data.get('phone', '')
        return normalize_phone_number(phone)

    def clean_contact_me_by_fax_only(self):
        """Honeypot перевірка (НЕ викидаємо ValidationError, обробимо в view)"""
        value = self.cleaned_data.get('contact_me_by_fax_only', '')
        if value:
            # Просто логуємо (помилку покажемо в view)
            logger.warning('[Honeypot] Field filled in form: %s', value[:50])
        return value





