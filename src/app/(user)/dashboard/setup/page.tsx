import { Box, Button, Container, Flex, Heading, Link, Text, TextField } from "@radix-ui/themes";
import { requireUser } from "@/lib/auth/require-user";
import { CanvasClient } from "@/lib/canvas/client";
import type { CanvasCourse } from "@/lib/canvas/types";
import { getIntegration } from "@/lib/integrations/repository";
import { decryptCredential } from "@/lib/security/credentials";
import { saveConnections, saveCourseSelection, saveSchedule } from "../actions";

type SetupPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const user = await requireUser();
  const integration = await getIntegration(user.id);
  const query = await searchParams;
  let courses: CanvasCourse[] = [];
  let courseLoadError: string | null = null;

  if (integration?.canvas_base_url && integration.canvas_token_ciphertext) {
    try {
      const canvas = new CanvasClient(
        integration.canvas_base_url,
        decryptCredential(integration.canvas_token_ciphertext),
      );
      courses = await canvas.getCourses();
    } catch {
      courseLoadError = "Sprigate could not reload your Canvas courses. Verify the connection below.";
    }
  }

  return (
    <Container size="2" py="9" px="4" minHeight="35em">
      <Flex direction="column" gap="6">
        <Box>
          <Link href="/dashboard">← Dashboard</Link>
          <Heading mt="3">Connection setup</Heading>
          <Text as="p" mt="2" color="gray">
            Credentials are encrypted before they are stored and are never sent to the browser again.
          </Text>
          {query.error ? <Text as="p" mt="3" color="red" role="alert">{query.error}</Text> : null}
          {query.saved ? <Text as="p" mt="3" color="green" role="status">Settings saved.</Text> : null}
        </Box>

        <Box className="rounded-md" p="6" style={{ backgroundColor: "var(--green-2)" }}>
          <Heading size="5">Canvas and Notion destination</Heading>
          <form action={saveConnections}>
            <Flex direction="column" gap="4" mt="4">
              <label>
                <Text as="div" mb="2" weight="medium">Canvas site</Text>
                <TextField.Root
                  name="canvasUrl"
                  type="url"
                  required
                  defaultValue={integration?.canvas_base_url ?? ""}
                  placeholder="https://canvas.yourschool.edu"
                />
              </label>
              <label>
                <Text as="div" mb="2" weight="medium">Canvas access token</Text>
                <TextField.Root
                  name="canvasToken"
                  type="password"
                  required={!integration?.canvas_token_ciphertext}
                  placeholder={integration?.canvas_token_ciphertext ? "Leave blank to keep the saved token" : "Paste token"}
                  autoComplete="off"
                />
              </label>
              <label>
                <Text as="div" mb="2" weight="medium">Notion parent page URL or ID</Text>
                <TextField.Root
                  name="notionPage"
                  required
                  defaultValue={integration?.notion_page_id ?? ""}
                  placeholder="https://www.notion.so/..."
                />
              </label>
              <Button type="submit">Verify and save</Button>
            </Flex>
          </form>
        </Box>

        {courseLoadError ? <Text color="red">{courseLoadError}</Text> : null}
        {courses.length ? (
          <Box className="rounded-md" p="6" style={{ outline: "var(--green-a6) solid 2px" }}>
            <Heading size="5">Courses to synchronize</Heading>
            <form action={saveCourseSelection}>
              <Flex direction="column" gap="3" mt="4">
                {courses.map((course) => (
                  <label key={course.id}>
                    <Flex gap="3" align="center">
                      <input
                        type="checkbox"
                        name="courseId"
                        value={course.id}
                        defaultChecked={integration?.selected_course_ids.includes(course.id)}
                      />
                      <Text>{course.name}</Text>
                    </Flex>
                  </label>
                ))}
                <Button type="submit" variant="soft">Save course selection</Button>
              </Flex>
            </form>
          </Box>
        ) : null}

        <Box className="rounded-md" p="6" style={{ outline: "var(--green-a6) solid 2px" }}>
          <Heading size="5">Automatic synchronization</Heading>
          <Text as="p" mt="2" color="gray">
            Sprigate checks hourly and runs when your selected interval is due.
          </Text>
          <form action={saveSchedule}>
            <Flex gap="3" mt="4" align="end" wrap="wrap">
              <label>
                <Text as="div" mb="2" weight="medium">Frequency</Text>
                <select
                  name="frequency"
                  defaultValue={integration?.sync_frequency ?? "manual"}
                  style={{ minHeight: 40, padding: "0 12px", borderRadius: 6 }}
                >
                  <option value="manual">Manual only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <Button type="submit" variant="soft">Save schedule</Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Container>
  );
}
