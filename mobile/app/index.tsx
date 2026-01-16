import { Redirect } from 'expo-router';

export default function Index() {
  // Logic kiểm tra token ở đây (giả sử chưa login)
  const isAuthenticated = false; 

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/sign-in" />;
  }
}