import { View } from 'react-native';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter(); 
  const [value, setValue] = React.useState('account');
  const [loginData, setLoginData] = React.useState({ email: '', password: '' });
  const [registerData, setRegisterData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

    // Função para login utilizando fetch
    const handleLogin = async () => {
      console.log('Login data:', loginData);
      try {
        const response = await fetch('http://localhost:3000/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Isso garante que o cookie será enviado nas requisições
          body: JSON.stringify(loginData),
        });
        if (!response.ok) {
          throw new Error('Erro na autenticação');
        }
        const data = await response.json();
          if (response.ok && data.token) {
            await AsyncStorage.setItem('authToken', data.token);
            console.log('Login successful:', data);
            router.push('/postScreen'); // Navega para a próxima tela após sucesso
            
          }
          else
          {
            console.log(document.cookie);
            console.log("Deu Ruim!")
            console.log(data)
            console.log(response)
          }
      } catch (error) {
        console.error('Erro ao realizar login:', error);
      }
    };
  
    // Função para registro utilizando fetch
    const handleRegister = async () => {
      console.log('Register data:', registerData);
      try {
        const response = await fetch('http://localhost:3000/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });
        if (!response.ok) {
          throw new Error('Erro ao registrar');
        }
        const data = await response.json();
        console.log('Registro bem-sucedido:', data);
        // Você pode redirecionar ou mostrar uma mensagem de sucesso aqui
      } catch (error) {
        console.error('Erro ao realizar o registro:', error);
      }
    };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 6 }}>
      <Label
        style={{
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 20,
          paddingHorizontal: 10,
        }}
      >
      </Label>
      <Tabs
        value={value}
        onValueChange={setValue}
        className="w-full max-w-[400px] mx-auto flex-col gap-1.5"
      >
        <TabsList className="flex-row w-full bg-transparent">
          <TabsTrigger
            value="account"
            className="flex-1"
            style={{
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            <Text>Login</Text>
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="flex-1"
            style={{
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            <Text>Cadastro</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <Label>Email</Label>
              <Input
                value={loginData.email}
                onChangeText={(text) =>
                  setLoginData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Digite seu email"
              />
              <Label>Senha</Label>
              <Input
                value={loginData.password}
                onChangeText={(text) =>
                  setLoginData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Digite sua senha"
                secureTextEntry
              />
            </CardContent>
            <CardFooter>
              <Button onPress={handleLogin}><Text>Entrar</Text></Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro</CardTitle>
              <CardDescription>
                Preencha os campos para criar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <Label>Nome Completo</Label>
              <Input
                value={registerData.name}
                onChangeText={(text) =>
                  setRegisterData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Digite seu nome"
              />
              <Label>Email</Label>
              <Input
                value={registerData.email}
                onChangeText={(text) =>
                  setRegisterData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Digite seu email"
              />
              <Label>Senha</Label>
              <Input
                value={registerData.password}
                onChangeText={(text) =>
                  setRegisterData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Digite sua senha"
                secureTextEntry
              />
              <Label>Confirme a senha</Label>
              <Input
                value={registerData.confirmPassword}
                onChangeText={(text) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    confirmPassword: text,
                  }))
                }
                placeholder="Confirme sua senha"
                secureTextEntry
              />
            </CardContent>
            <CardFooter>
              <Button onPress={handleRegister}><Text>Cadastrar</Text></Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </View>
  );
} 