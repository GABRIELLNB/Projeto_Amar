from django.urls import path
from .views import CadastroView, PreCadastroFuncionarioView
#from .views import LoginView
#from .views import EditarPerfilView
#from .views import ForumDetaiView

urlpatterns = [
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),
    path('api/cadastro-funcionario/', PreCadastroFuncionarioView.as_view(), name='cadastro-funcionario'),
    #path('api/Login/', LoginView.as_view(), name='Login'),
    #path('api/Menu/', MenuView.as_view(), name='Menu'),
    #path('api/Editar Perfil',EditarPerfilView.as_view(), name='Editar Perfil'),
    #path('api/Forums', ForumDetaiView.as_view(), name= 'forums'),
    
]