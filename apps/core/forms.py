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
    """Форма для заявки на консультацію"""
    prefers_messenger = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-group__checkbox',
        }),
        label='Хочу консультацію в переписці'
    )

    class Meta:
        model = ConsultationRequest
        fields = ['phone', 'prefers_messenger', 'messenger_choice']
        widgets = {
            'phone': forms.TextInput(attrs={
                'placeholder': '+38 (0XX) XXX XX XX',
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

    def clean_phone(self):
        """Нормалізувати телефон до +380XXXXXXXXX (формат моделі: ^\+380\d{9}$)"""
        phone = self.cleaned_data.get('phone', '')
        return normalize_phone_number(phone)

