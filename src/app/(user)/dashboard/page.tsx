import { Box, Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import { signOut } from "@/app/(user)/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Container size="2" py="9" px="4" minHeight="35em">
      <Flex direction="column" gap="6">
        <Box>
          <Heading>Sprigate dashboard</Heading>
          <Text as="p" mt="2" color="gray">
            Signed in as {user.email ?? "your Notion account"}.
          </Text>
        </Box>

        <Box
          className="rounded-md"
          p="6"
          style={{
            outline: "var(--green-a6) solid 4px",
            outlineOffset: "-1px",
            backgroundColor: "var(--green-2)",
          }}
        >
          <Heading size="5">Next: connect Canvas</Heading>
          <Text as="p" mt="2">
            Canvas onboarding and manual synchronization will be added in the next milestone.
          </Text>
        </Box>

        <form action={signOut}>
          <Button type="submit" variant="soft">
            Sign out
          </Button>
        </form>
      </Flex>
    </Container>
  );
}
