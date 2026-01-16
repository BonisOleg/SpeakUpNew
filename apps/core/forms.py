from django import forms
from .models import Testimonial, ConsultationRequest
from apps.leads.utils import normalize_phone_number


# ============================================================================
# Homepage Content Forms
# ============================================================================

class TestimonialForm(forms.ModelForm):
    """Форма для відгуків клієнтів"""
    class Meta:
        model = Testimonial
        fields = ['name', 'text', 'rating']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': "Ваше ім'я",
                'class': 'form-group__input',
                'required': True,
            }),
            'text': forms.Textarea(attrs={
                'placeholder': 'Ваш відгук',
                'class': 'form-group__input',
                'rows': 5,
                'required': True,
            }),
            'rating': forms.NumberInput(attrs={
                'min': 1,
                'max': 5,
                'value': 5,
                'class': 'form-group__input',
            }),
        }


class ConsultationForm(forms.ModelForm):
    """Форма для заявки на консультацію на головній сторінці"""
    prefers_messenger = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-group__checkbox',
        }),
        label='Хочу консультацію в переписці'
    )

    class Meta:
        model = ConsultationRequest
        fields = ['name', 'phone', 'prefers_messenger', 'messenger_choice']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': "Ваше ім'я",
                'class': 'form-group__input',
                'required': False,
            }),
            'phone': forms.TextInput(attrs={
                'placeholder': 'Введіть номер телефону',
                'class': 'form-group__input',
                'type': 'tel',
                'inputmode': 'tel',
                'required': True,
                'autocomplete': 'tel',
            }),
            'messenger_choice': forms.RadioSelect(attrs={
                'class': 'messenger-choice',
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Приховати messenger_choice за замовчуванням
        self.fields['messenger_choice'].widget.attrs['style'] = 'display: none;'
        self.fields['messenger_choice'].required = False
        # Зробити name необов'язковим
        self.fields['name'].required = False

    def clean_phone(self):
        """Нормалізувати телефон до +380XXXXXXXXX (формат моделі: ^\+380\d{9}$)"""
        phone = self.cleaned_data.get('phone', '')
        return normalize_phone_number(phone)

    def clean_name(self):
        """Валідація імені: якщо введено, то мінімум 2 символи"""
        name = self.cleaned_data.get('name', '').strip()
        if name and len(name) < 2:
            raise forms.ValidationError("Ім'я має містити мінімум 2 символи")
        return name if name else None


class CorporateConsultationForm(forms.ModelForm):
    """Форма для заявки на консультацію від корпоративних клієнтів"""
    prefers_messenger = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-group__checkbox',
        }),
        label='Хочу консультацію в переписці'
    )

    class Meta:
        model = ConsultationRequest
        fields = ['name', 'email', 'phone', 'prefers_messenger', 'messenger_choice']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': "Ваше ім'я",
                'class': 'form-group__input',
                'required': False,
            }),
            'email': forms.EmailInput(attrs={
                'placeholder': 'Електронна адреса',
                'class': 'form-group__input',
                'required': False,
                'autocomplete': 'email',
            }),
            'phone': forms.TextInput(attrs={
                'placeholder': 'Введіть номер телефону',
                'class': 'form-group__input',
                'type': 'tel',
                'inputmode': 'tel',
                'required': True,
                'autocomplete': 'tel',
            }),
            'messenger_choice': forms.RadioSelect(attrs={
                'class': 'messenger-choice',
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Приховати messenger_choice за замовчуванням
        self.fields['messenger_choice'].widget.attrs['style'] = 'display: none;'
        self.fields['messenger_choice'].required = False
        # Зробити name та email необов'язковими
        self.fields['name'].required = False
        self.fields['email'].required = False

    def clean_phone(self):
        """Нормалізувати телефон до +380XXXXXXXXX (формат моделі: ^\+380\d{9}$)"""
        phone = self.cleaned_data.get('phone', '')
        return normalize_phone_number(phone)

    def clean_name(self):
        """Валідація імені: якщо введено, то мінімум 2 символи"""
        name = self.cleaned_data.get('name', '').strip()
        if name and len(name) < 2:
            raise forms.ValidationError("Ім'я має містити мінімум 2 символи")
        return name if name else None
