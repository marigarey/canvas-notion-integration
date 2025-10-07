import Form from 'next/form'
import createUser from '../(user)/signup/actions'
import { Flex, Button} from "@radix-ui/themes";

export default function SignupForm() {
  // add security to password stuff
  return (
    <Form action={createUser}>
      <Flex direction="column" gap="4" pt="4">
        <Button type="submit">
          Sign in with Notion
        </Button>
      </Flex>
    </Form>
  )
}