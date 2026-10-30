import { Button, Flex } from "@radix-ui/themes";
import { signInWithNotion } from "@/app/(user)/auth/actions";

export default function NotionAuthForm() {
  return (
    <form action={signInWithNotion}>
      <Flex direction="column" gap="4" pt="4">
        <Button type="submit">
          Sign in with Notion
        </Button>
      </Flex>
    </form>
  );
}
