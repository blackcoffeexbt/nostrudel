import { Link as RouterLink } from "react-router-dom";
import { AvatarGroup, Card, CardBody, CardFooter, CardHeader, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { Kind } from "nostr-tools";
import dayjs from "dayjs";

import { UserAvatarLink } from "../../../components/user-avatar-link";
import { UserLink } from "../../../components/user-link";
import { getEventsFromList, getListName, getPubkeysFromList } from "../../../helpers/nostr/lists";
import { getSharableEventNaddr } from "../../../helpers/nip19";
import { NostrEvent } from "../../../types/nostr-event";
import useReplaceableEvent from "../../../hooks/use-replaceable-event";
import { createCoordinate } from "../../../services/replaceable-event-requester";
import { EventRelays } from "../../../components/note/note-relays";
import { NoteLink } from "../../../components/note-link";
import { useRegisterIntersectionEntity } from "../../../providers/intersection-observer";
import { useRef } from "react";
import ListFavoriteButton from "./list-favorite-button";
import { getEventUID } from "../../../helpers/nostr/events";

function ListCardRender({ event }: { event: NostrEvent }) {
  const people = getPubkeysFromList(event);
  const notes = getEventsFromList(event);
  const link =
    event.kind === Kind.Contacts ? createCoordinate(Kind.Contacts, event.pubkey) : getSharableEventNaddr(event);

  // if there is a parent intersection observer, register this card
  const ref = useRef<HTMLDivElement | null>(null);
  useRegisterIntersectionEntity(ref, getEventUID(event));

  return (
    <Card ref={ref}>
      <CardHeader p="2" pb="0">
        <Heading size="md">
          <Link as={RouterLink} to={`/lists/${link}`}>
            {getListName(event)}
          </Link>
        </Heading>
      </CardHeader>
      <CardBody p="2">
        <Flex gap="2">
          <Text>Created by:</Text>
          <UserAvatarLink pubkey={event.pubkey} size="xs" />
          <UserLink pubkey={event.pubkey} isTruncated fontWeight="bold" fontSize="lg" />
        </Flex>
        <Text>Updated: {dayjs.unix(event.created_at).fromNow()}</Text>
        {people.length > 0 && (
          <>
            <Text>People ({people.length}):</Text>
            <AvatarGroup overflow="hidden" mb="2" max={16} size="sm">
              {people.map(({ pubkey, relay }) => (
                <UserAvatarLink key={pubkey} pubkey={pubkey} relay={relay} />
              ))}
            </AvatarGroup>
          </>
        )}
        {notes.length > 0 && (
          <>
            <Text>Notes ({notes.length}):</Text>
            <Flex gap="2" overflow="hidden">
              {notes.map(({ id, relay }) => (
                <NoteLink key={id} noteId={id} />
              ))}
            </Flex>
          </>
        )}
      </CardBody>
      <CardFooter p="2" display="flex" pt="0">
        <ListFavoriteButton list={event} size="sm" />
        <EventRelays event={event} ml="auto" />
      </CardFooter>
    </Card>
  );
}

export default function ListCard({ cord, event: maybeEvent }: { cord?: string; event?: NostrEvent }) {
  const event = maybeEvent ?? (cord ? useReplaceableEvent(cord as string) : undefined);
  if (!event) return null;
  else return <ListCardRender event={event} />;
}
