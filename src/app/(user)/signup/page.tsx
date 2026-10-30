import { Box, Container, Heading, Text } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import NotionAuthForm from "@/app/ui/signup";
import { createClient } from "@/lib/supabase/server";

export default async function Signup() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Container size="1" py="9" px="2" minHeight={"35em"}>
        <Box className="rounded-md" p="6"
            style={{outline: "var(--green-a6) solid 4px", outlineOffset: "-1px", opacity: "100", backgroundColor:"var(--green-2)"}}
          >
          <Heading>Get started</Heading>
          <Text as="p" mt="2" color="gray">
            Connect Notion first. You will choose your Canvas courses and database after signing in.
          </Text>
          <NotionAuthForm />
        </Box>
    </Container>
  );
}
