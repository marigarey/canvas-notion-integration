import { Box, Button, Container, Flex, Heading, Link, Text, TextField } from "@radix-ui/themes";
import { requireUser } from "@/lib/auth/require-user";
import { deleteAccount, disconnectIntegrations } from "../actions";

type AccountPageProps = {
  searchParams: Promise<{ error?: string; disconnected?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  await requireUser();
  const query = await searchParams;

  return (
    <Container size="2" py="9" px="4" minHeight="35em">
      <Flex direction="column" gap="6">
        <Box>
          <Link href="/dashboard">← Dashboard</Link>
          <Heading mt="3">Account and data</Heading>
          {query.error ? <Text as="p" mt="3" color="red" role="alert">{query.error}</Text> : null}
          {query.disconnected ? (
            <Text as="p" mt="3" color="green" role="status">Saved integrations were removed.</Text>
          ) : null}
        </Box>

        <Box p="6" className="rounded-md" style={{ outline: "var(--amber-a7) solid 2px" }}>
          <Heading size="5">Disconnect services</Heading>
          <Text as="p" mt="2">
            Removes encrypted Canvas and Notion credentials, course selections, and sync history.
            Your Sprigate login remains active. Existing Notion pages are not deleted.
          </Text>
          <form action={disconnectIntegrations}>
            <Flex direction="column" gap="3" mt="4">
              <TextField.Root name="confirmation" placeholder="Type DISCONNECT" required />
              <Button type="submit" color="amber" variant="soft">Disconnect services</Button>
            </Flex>
          </form>
        </Box>

        <Box p="6" className="rounded-md" style={{ outline: "var(--red-a7) solid 2px" }}>
          <Heading size="5">Delete account</Heading>
          <Text as="p" mt="2">
            Permanently deletes your Sprigate account and saved integration data. Existing Notion pages are not deleted.
          </Text>
          <form action={deleteAccount}>
            <Flex direction="column" gap="3" mt="4">
              <TextField.Root name="confirmation" placeholder="Type DELETE" required />
              <Button type="submit" color="red">Delete account permanently</Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Container>
  );
}
