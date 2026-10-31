import { Box, Button, Container, Flex, Heading, Link, Text } from "@radix-ui/themes";
import { signInWithNotion, signOut } from "@/app/(user)/auth/actions";
import { runManualSync } from "./actions";
import { requireUser } from "@/lib/auth/require-user";
import { getIntegration } from "@/lib/integrations/repository";

type DashboardProps = {
  searchParams: Promise<{ error?: string; synced?: string }>;
};

export default async function Dashboard({ searchParams }: DashboardProps) {
  const user = await requireUser();
  const integration = await getIntegration(user.id);
  const query = await searchParams;
  const canvasConnected = Boolean(integration?.canvas_token_ciphertext);
  const notionConnected = Boolean(integration?.notion_access_token_ciphertext);
  const setupComplete = canvasConnected && notionConnected && Boolean(integration?.notion_page_id);

  return (
    <Container size="2" py="9" px="4" minHeight="35em">
      <Flex direction="column" gap="6">
        <Box>
          <Heading>Sprigate dashboard</Heading>
          <Text as="p" mt="2" color="gray">
            Signed in as {user.email ?? "your Notion account"}.
          </Text>
          {query.error ? (
            <Text as="p" mt="3" color="red" role="alert">
              {query.error === "notion_connection"
                ? "Notion signed you in, but Sprigate could not save the workspace connection. Try signing in again."
                : query.error}
            </Text>
          ) : null}
          {query.synced ? (
            <Text as="p" mt="3" color="green" role="status">
              Synchronization finished.
            </Text>
          ) : null}
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
          <Heading size="5">Connections</Heading>
          <Flex direction="column" gap="2" mt="3">
            <Text>Notion: {notionConnected ? "Connected" : "Needs reconnection"}</Text>
            <Text>Canvas: {canvasConnected ? "Connected" : "Not connected"}</Text>
            <Text>Selected courses: {integration?.selected_course_ids.length ?? 0}</Text>
          </Flex>
          <Flex gap="3" mt="4" wrap="wrap">
            <Link href="/dashboard/setup">
              <Button variant="soft">Configure connections</Button>
            </Link>
            {!notionConnected ? (
              <form action={signInWithNotion}>
                <Button type="submit" variant="outline">Reconnect Notion</Button>
              </form>
            ) : null}
          </Flex>
        </Box>

        <Box
          className="rounded-md"
          p="6"
          style={{ outline: "var(--green-a6) solid 2px", outlineOffset: "-1px" }}
        >
          <Heading size="5">Synchronization</Heading>
          <Text as="p" mt="2">
            {integration?.last_sync_message ?? "No synchronization has run yet."}
          </Text>
          <Text as="p" mt="1" color="gray">
            Schedule: {integration?.sync_frequency ?? "manual"}
            {integration?.next_sync_at
              ? ` · Next due ${new Date(integration.next_sync_at).toLocaleString()}`
              : ""}
          </Text>
          {integration?.last_synced_at ? (
            <Text as="p" mt="1" color="gray">
              Last completed {new Date(integration.last_synced_at).toLocaleString()}.
            </Text>
          ) : null}
          <form action={runManualSync}>
            <Button type="submit" mt="4" disabled={!setupComplete || !integration?.selected_course_ids.length}>
              Sync now
            </Button>
          </form>
        </Box>

        <form action={signOut}>
          <Flex gap="3" align="center">
            <Button type="submit" variant="soft">Sign out</Button>
            <Link href="/dashboard/account">Account and data</Link>
          </Flex>
        </form>
      </Flex>
    </Container>
  );
}
