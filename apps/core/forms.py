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
                'pattern': r'\+380\d{9}',
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
        """Нормалізувати телефон: видалити пробіли"""
        phone = self.cleaned_data.get('phone', '')
        if phone:
            # Видалити всі пробіли
            phone = phone.replace(' ', '')
        return phone

