'use client'

import { Heading, Box, TextField, Flex, Button, TextArea} from "@radix-ui/themes";
import sendMessage from "@/app/(website)/contact/actions";
import Form from 'next/form'


export default function ContactForm({ error }: { error?: string }) {
  return (
    <Form action={sendMessage}>
      <Flex direction="column" gap="4" pt="4">
        {error ? <p role="alert" style={{ color: "var(--red-11)" }}>{error}</p> : null}
        <label style={{ display: "none" }} aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <Box>
          <Heading size="4">Email:</Heading>
          <Box pt="2">
            <TextField.Root type="email" name="email" required placeholder="Enter your email...">
            </TextField.Root>
          </Box>
        </Box>
        <Box>
          <Heading size="4">Subject:</Heading>
          <Box pt="2">
            <TextField.Root name="subject" required placeholder="Enter subject...">
            </TextField.Root>
          </Box>
        </Box>
        <Box>
          <Heading size="4">Message:</Heading>
          <Box pt="2">
            <TextArea name="message" resize="vertical" required placeholder="Type message here..." />
          </Box>
        </Box>
        <Button type="submit">
          Submit
        </Button>
      </Flex>
    </Form>
  )
}
