import { Heading, Box, TextField, Flex, Button, TextArea } from "@radix-ui/themes";
import SendMessage from "@/app/(website)/contact/actions";
import Form from 'next/form'

export default function ContactForm() {
  return (
    <Form action={SendMessage}>
      <Flex direction="column" gap="4" pt="4">
        <Box>
          <Heading size="4">Email:</Heading>
          <Box pt="2">
            <TextField.Root name="email" placeholder="Enter your email...">
            </TextField.Root>
          </Box>
        </Box>
        <Box>
          <Heading size="4">Subject:</Heading>
          <Box pt="2">
            <TextField.Root name="subject" placeholder="Enter subject...">
            </TextField.Root>
          </Box>
        </Box>
        <Box>
          <Heading size="4">Message:</Heading>
          <Box pt="2">
            <TextArea name="message" resize="vertical" placeholder="Type message here..." />
          </Box>
        </Box>
        <Button type="submit">
          Submit
        </Button>
      </Flex>
    </Form>
  )
}