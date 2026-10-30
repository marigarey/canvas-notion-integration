import { Box, Container, Heading, Text } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import NotionAuthForm from "@/app/ui/signup";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Login({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
      <Box className="rounded-md" p="6"
          style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
        >
          <Heading>Login</Heading>
          <Text as="p" mt="2" color="gray">
            Use your Notion account to continue to Sprigate.
          </Text>
          {error ? (
            <Text as="p" mt="3" color="red" role="alert">
              We could not complete the Notion login. Please try again.
            </Text>
          ) : null}
          <NotionAuthForm />
      </Box>

    </Container>
  );
}
