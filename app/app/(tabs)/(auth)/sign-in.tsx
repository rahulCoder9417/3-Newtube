import { View, Text, TextInput, Button } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    // Later: connect backend here
    console.log(email, password);

    // After login → go to home
    router.replace("/");
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Sign In
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 6,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 6,
        }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
