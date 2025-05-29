from django.urls import path
from .views import CadastroView
from .views import LoginView
from .views import MenuView

urlpatterns = [
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),
    path('api/Login/', LoginView.as_view(), name='Login'),
    path('api/Menu/', MenuView.as_view(), name='Login'),

]