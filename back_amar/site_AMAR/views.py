import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from .models import User
from django.contrib.auth.hashers import check_password
from django.shortcuts import render, redirect
from .models import User, Adimitidos, Estagiario, Profissional


@csrf_exempt  # Apenas durante testes sem CSRF. Em produção, usar proteção.
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cpf = data.get('cpf')
            senha = data.get('senha')

            try:
                usuario = User.objects.get(cpf=cpf)
                if check_password(senha, usuario.senha):
                    return JsonResponse({
                        'mensagem': 'Login bem-sucedido!',
                        'nome': usuario.nome,
                        'cpf': usuario.cpf,
                        'user_id': usuario.id,
                    }, status=200)
                else:
                    return JsonResponse({'erro': 'Senha incorreta.'}, status=401)
            except User.DoesNotExist:
                return JsonResponse({'erro': 'Usuário não encontrado.'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'erro': 'JSON inválido.'}, status=400)

    return JsonResponse({'erro': 'Método não permitido.'}, status=405)




@csrf_exempt #apenas para teste tirar antes de aprtesentar

def cadastro(request):
    if request.method == "POST":
        cpf = request.POST.get('cpf')
        nome = request.POST.get('nome')
        email = request.POST.get('email')
        telefone = request.POST.get('telefone')
        senha = request.POST.get('senha')

        try:
            adimitido = Adimitidos.objects.get(cpf=cpf)
        except Adimitidos.DoesNotExist:
            adimitido = None

        user = User.objects.create(
            user=adimitido,
            nome=nome,
            email=email,
            telefone=telefone,
            senha=make_password(senha)
        )

        # Se estiver na lista de Adimitidos e tiver matrícula
        if adimitido and adimitido.matricula:
            # Verifica se matrícula está em Estagiario ou Profissional
            if Profissional.objects.filter(matricula=adimitido.matricula).exists():
                Profissional.objects.create(user=user, matricula=adimitido.matricula)
            elif Estagiario.objects.filter(matricula=adimitido.matricula).exists():
                Estagiario.objects.create(user=user, matricula=adimitido.matricula)

        return JsonResponse({'mensagem': 'Cadastro realizado com sucesso'}, status=201)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Profissional  # Adicione Estagiario ou outros se quiser
import json

@csrf_exempt
def menu_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')

            if not user_id:
                return JsonResponse({'erro': 'ID do usuário não enviado.'}, status=400)

            try:
                user = User.objects.get(id=user_id)

                # Exemplo de dados fictícios para o "menu"
                forum_cards = [
                    {
                        'autor': 'Antonio Carlos',
                        'tema': 'Preconceito no processo de adoção para pessoas LGBTQIAP+',
                        'avaliacoes': {
                            'curtidas': 1500,
                            'comentarios': 5
                        },
                        'link': '/forum/1'
                    }
                ]

                propagandas = [
                    {
                        'imagem': 'https://exemplo.com/campus.jpg',
                        'titulo': 'Campus Comércio',
                        'descricao': 'Conheça os novos cursos semipresenciais'
                    },
                    {
                        'imagem': 'https://exemplo.com/cursos.jpg',
                        'titulo': 'Novos Cursos',
                        'descricao': 'Cursos com 100% de desconto na matrícula!'
                    }
                ]

                profissionais = list(Profissional.objects.values('cpf', 'tipo_serviço'))

                return JsonResponse({
                    'nome': user.nome,
                    'cpf': user.cpf,
                    'forum_cards': forum_cards,
                    'propagandas': propagandas,
                    'profissionais': profissionais,
                }, status=200)

            except User.DoesNotExist:
                return JsonResponse({'erro': 'Usuário não encontrado.'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'erro': 'Erro ao processar JSON'}, status=400)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)
