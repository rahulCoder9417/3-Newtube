import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Welcome 👋
      </Text>

      <Link href="/sign-in" asChild>
        <Button title="Sign In" />
      </Link>

      <Link href="/sign-up" asChild>
        <Button title="Sign Up" />
      </Link>
    </View>
  );
}
