import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Heading, useToast, Flex, Spacer, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Textarea } from "@chakra-ui/react";
import { FaSignInAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchEvents();
    }
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchEvents();
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchEvents();
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEvents([]);
    toast({
      title: "Logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name: event.target.name.value,
            description: event.target.description.value,
          },
        }),
      });
      const data = await response.json();
      setEvents([...events, data.data]);
      onClose();
      toast({
        title: "Event created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateEvent = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name: event.target.name.value,
            description: event.target.description.value,
          },
        }),
      });
      const data = await response.json();
      const updatedEvents = events.map((event) => (event.id === data.data.id ? data.data : event));
      setEvents(updatedEvents);
      onClose();
      toast({
        title: "Event updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      toast({
        title: "Event deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box p={4}>
      <Flex alignItems="center" mb={4}>
        <Heading as="h1" size="xl">
          Event Management
        </Heading>
        <Spacer />
        {isLoggedIn ? (
          <Button leftIcon={<FaSignOutAlt />} colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        ) : null}
      </Flex>
      {!isLoggedIn ? (
        <VStack spacing={4} align="stretch">
          <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <Button leftIcon={<FaSignInAlt />} colorScheme="blue" onClick={handleLogin}>
            Login
          </Button>
          <Button colorScheme="green" onClick={handleRegister}>
            Register
          </Button>
        </VStack>
      ) : (
        <>
          <Flex alignItems="center" mb={4}>
            <Heading as="h2" size="lg">
              Events
            </Heading>
            <Spacer />
            <IconButton
              icon={<FaPlus />}
              colorScheme="green"
              onClick={() => {
                setSelectedEvent(null);
                onOpen();
              }}
            />
          </Flex>
          {events.map((event) => (
            <Box key={event.id} p={4} borderWidth={1} mb={4}>
              <Flex alignItems="center">
                <Box>
                  <Heading as="h3" size="md">
                    {event.attributes.name}
                  </Heading>
                  <Text>{event.attributes.description}</Text>
                </Box>
                <Spacer />
                <IconButton
                  icon={<FaEdit />}
                  colorScheme="blue"
                  mr={2}
                  onClick={() => {
                    setSelectedEvent(event);
                    onOpen();
                  }}
                />
                <IconButton icon={<FaTrash />} colorScheme="red" onClick={() => handleDeleteEvent(event.id)} />
              </Flex>
            </Box>
          ))}
        </>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedEvent ? "Edit Event" : "Create Event"}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}>
            <ModalBody>
              <FormControl id="name" mb={4}>
                <FormLabel>Name</FormLabel>
                <Input type="text" name="name" defaultValue={selectedEvent?.attributes.name} />
              </FormControl>
              <FormControl id="description">
                <FormLabel>Description</FormLabel>
                <Textarea name="description" defaultValue={selectedEvent?.attributes.description} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" type="submit" mr={3}>
                {selectedEvent ? "Update" : "Create"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Index;
