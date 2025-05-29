from django.urls import path
from .views import CadastroView


urlpatterns = [
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),

]