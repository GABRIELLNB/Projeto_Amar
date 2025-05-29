from django.urls import path
from .views import CadastroView
from .views import LoginView


urlpatterns = [
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),
    path('api/cadastro/', LoginView.as_view(), name='Login'),

]