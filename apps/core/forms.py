from django import forms
from .models import Testimonial, ConsultationRequest


class ExampleForm(forms.Form):
    """Example form with proper validation."""
    name = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your name',
        })
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your email',
            'inputmode': 'email',
        })
    )
    phone = forms.CharField(
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={
            'type': 'tel',
            'class': 'form-input',
            'placeholder': 'Enter your phone',
            'inputmode': 'tel',
        })
    )


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
                'placeholder': '+380',
                'class': 'form-group__input',
                'type': 'tel',
                'inputmode': 'tel',
                'pattern': r'(\+?380|0)\d{9}',
                'required': True,
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
        """Нормалізувати телефон до +380XXXXXXXXX"""
        phone = self.cleaned_data.get('phone', '').strip()
        if not phone:
            return phone

        # Видалити всі пробіли, дужки, дефіси
        phone = phone.replace(' ', '').replace('(', '').replace(')', '').replace('-', '')

        # Витягти тільки цифри
        digits = ''.join(filter(str.isdigit, phone))

        # Нормалізація:
        if phone.startswith('+380') and len(digits) == 12:
            # +380XXXXXXXXX -> залишити як є
            phone = '+' + digits
        elif digits.startswith('0') and len(digits) == 10:
            # 0XXXXXXXXX -> +380XXXXXXXXX
            phone = '+380' + digits[1:]
        elif digits.startswith('380') and len(digits) == 12:
            # 380XXXXXXXXX -> +380XXXXXXXXX
            phone = '+' + digits
        elif digits.startswith('380') and len(digits) == 11:
            # Помилка: 380XXXXXXXX (тільки 8 цифр після 380)
            raise forms.ValidationError("Номер має містити 9 цифр після коду 380")
        else:
            raise forms.ValidationError("Введіть номер у форматі +380, 380 або 0")

        return phone

