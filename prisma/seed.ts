// prisma/seed.ts
import {
  Event_visibility,
  Member_status,
  PrismaClient,
  Sex,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

async function main() {
  const users = [
    {
      email: 'seto.kaiba@hotmail.fr',
      password: await hashPassword('Amir398!'),
      firstname: 'Seto',
      lastname: 'Kaiba',
      birthdate: new Date('1998-01-31T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'AAAAAAAAAAAAAAAAAAAAAAAA',
      phone: '+33609032663',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'yugi.muto@hotmail.fr',
      password: await hashPassword('Yugi398!'),
      firstname: 'Yugi',
      lastname: 'Muto',
      birthdate: new Date('1999-06-04T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Le roi des duels',
      phone: '+33609032664',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'joey.wheeler@hotmail.fr',
      password: await hashPassword('Joey398!'),
      firstname: 'Joey',
      lastname: 'Wheeler',
      birthdate: new Date('1999-01-25T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Duelliste passionné',
      phone: '+33609032665',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'marik.ishtar@hotmail.fr',
      password: await hashPassword('Marik398!'),
      firstname: 'Marik',
      lastname: 'Ishtar',
      birthdate: new Date('1999-01-25T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Protecteur du pharaon',
      phone: '+33609032658',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'yuji.itadori@hotmail.fr',
      password: await hashPassword('Yuji398!'),
      firstname: 'Yuji',
      lastname: 'Itadori',
      birthdate: new Date('2001-03-20T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Exorciste à la force surhumaine et hôte de Sukuna',
      phone: '+33609032663',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'megumi.fushiguro@hotmail.fr',
      password: await hashPassword('Megumi398!'),
      firstname: 'Megumi',
      lastname: 'Fushiguro',
      birthdate: new Date('2001-07-22T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Maître des shikigamis et élève de l’école d’exorcisme',
      phone: '+33609032664',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'nobara.kugisaki@hotmail.fr',
      password: await hashPassword('Nobara398!'),
      firstname: 'Nobara',
      lastname: 'Kugisaki',
      birthdate: new Date('2001-08-07T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Exorciste au caractère explosif et style de combat unique',
      phone: '+33609032665',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'satoru.gojo@hotmail.fr',
      password: await hashPassword('Gojo398!'),
      firstname: 'Satoru',
      lastname: 'Gojo',
      birthdate: new Date('1989-12-07T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'L’exorciste le plus puissant avec les Six Yeux',
      phone: '+33609032666',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'yuta.okkotsu@hotmail.fr',
      password: await hashPassword('Yuta398!'),
      firstname: 'Yuta',
      lastname: 'Okkotsu',
      birthdate: new Date('2001-04-18T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Exorciste de classe spéciale lié à Rika Orimoto',
      phone: '+33609032667',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'eren.yeager@hotmail.fr',
      password: await hashPassword('Eren398!'),
      firstname: 'Eren',
      lastname: 'Yeager',
      birthdate: new Date('2003-03-30T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Ancien héros devenu une légende sombre',
      phone: '+33609032668',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'tanjiro.kamado@hotmail.fr',
      password: await hashPassword('Tanjiro398!'),
      firstname: 'Tanjiro',
      lastname: 'Kamado',
      birthdate: new Date('2002-07-14T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Pourfendeur de démons au cœur pur',
      phone: '+33609032670',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'ryomen.sukuna@hotmail.fr',
      password: await hashPassword('Sukuna398!'),
      firstname: 'Ryomen',
      lastname: 'Sukuna',
      birthdate: new Date('1000-01-01T00:00:00Z'),
      sex: Sex.MALE,
      bio: 'Roi des Fléaux, tyran au sourire glaçant',
      phone: '+33609032660',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'hinata.hyuga@hotmail.fr',
      password: await hashPassword('Hinata398!'),
      firstname: 'Hinata',
      lastname: 'Hyuga',
      birthdate: new Date('1997-12-27T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Princesse du clan Hyuga et experte du Byakugan',
      phone: '+33609032672',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'tsunade.senju@hotmail.fr',
      password: await hashPassword('Tsunade398!'),
      firstname: 'Tsunade',
      lastname: 'Senju',
      birthdate: new Date('1968-08-02T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Sannin légendaire et experte en médecine',
      phone: '+33609032673',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'maki.zenin@hotmail.fr',
      password: await hashPassword('Maki398!'),
      firstname: 'Maki',
      lastname: 'Zenin',
      birthdate: new Date('2001-09-25T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Combattante talentueuse rejetée par le clan Zenin',
      phone: '+33609032671',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'nami.swan@hotmail.fr',
      password: await hashPassword('Nami398!'),
      firstname: 'Nami',
      lastname: 'Swan',
      birthdate: new Date('2001-07-03T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Navigatrice des Pirates au Chapeau de Paille',
      phone: '+33609032666',
      image_url: '1738433236109explore2.png',
    },
    {
      email: 'robin.nico@hotmail.fr',
      password: await hashPassword('Robin398!'),
      firstname: 'Robin',
      lastname: 'Nico',
      birthdate: new Date('1998-02-06T00:00:00Z'),
      sex: Sex.FEMALE,
      bio: 'Archéologue des Pirates au Chapeau de Paille',
      phone: '+33609032667',
      image_url: '1738433236109explore2.png',
    },
  ];

  const createdUsers: { id: string }[] = [];
  for (const user of users) {
    const createdUser = await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push({ id: createdUser.id });
    console.log(`Created user: ${user.email}`);
  }

  const events = [
    {
      title: 'Soirée Gastronomique',
      start_time: new Date('2025-06-15T18:00:00Z'),
      end_time: new Date('2025-06-15T23:00:00Z'),
      address: '5 Rue des Dames, Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      max_participants: 4,
      visibility: Event_visibility.PUBLIC,
      entry_fee: 20,
      description: 'Une soirée pleine de saveurs et de découvertes culinaires.',
      creator_id: createdUsers[0].id,
    },
    {
      title: 'Concert au bord de la Seine',
      start_time: new Date('2025-06-20T20:00:00Z'),
      end_time: new Date('2025-06-20T23:59:59Z'),
      address: 'Quai de la Tournelle, Paris',
      latitude: 48.8501,
      longitude: 2.3508,
      max_participants: 6,
      visibility: Event_visibility.FRIENDSONLY,
      entry_fee: 30,
      description: 'Un concert en plein air au bord de la Seine.',
      creator_id: createdUsers[1].id,
    },
    {
      title: 'Atelier de Peinture',
      start_time: new Date('2025-06-18T14:00:00Z'),
      end_time: new Date('2025-06-18T17:00:00Z'),
      address: '12 Place des Vosges, Paris',
      latitude: 48.8543,
      longitude: 2.3652,
      max_participants: 10,
      visibility: Event_visibility.PRIVATE,
      entry_fee: 15,
      description:
        'Venez découvrir les techniques de peinture avec un artiste local.',
      creator_id: createdUsers[2].id,
    },
    {
      title: 'Balade Nature en Île-de-France',
      start_time: new Date('2025-06-25T09:00:00Z'),
      end_time: new Date('2025-06-25T13:00:00Z'),
      address: 'Forêt de Fontainebleau',
      latitude: 48.4049,
      longitude: 2.7016,
      max_participants: 30,
      visibility: Event_visibility.PUBLIC,
      entry_fee: 10,
      description:
        'Une promenade guidée dans la magnifique forêt de Fontainebleau.',
      creator_id: createdUsers[4].id,
    },
    {
      title: 'Workshop Tech',
      start_time: new Date('2025-06-12T10:00:00Z'),
      end_time: new Date('2025-06-12T16:00:00Z'),
      address: 'La Défense, Paris',
      latitude: 48.8924,
      longitude: 2.2353,
      max_participants: 100,
      visibility: Event_visibility.PUBLIC,
      entry_fee: 50,
      description: 'Une journée dédiée aux dernières avancées en technologie.',
      creator_id: createdUsers[5].id,
    },
  ];

  const createdEvents: { id: string; title: string }[] = [];
  for (const event of events) {
    const createdEvent = await prisma.events.create({
      data: event,
    });
    createdEvents.push({ id: createdEvent.id, title: createdEvent.title });
    console.log(`Created event: ${event.title}`);
  }

  const members = [
    //! event 1
    {
      event_id: createdEvents[0].id,
      user_id: createdUsers[1].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[0].id,
      user_id: createdUsers[2].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[0].id,
      user_id: createdUsers[3].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[0].id,
      user_id: createdUsers[4].id,
      status: Member_status.CONFIRMED,
    },
    //! event 2
    {
      event_id: createdEvents[1].id,
      user_id: createdUsers[0].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[1].id,
      user_id: createdUsers[8].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[1].id,
      user_id: createdUsers[9].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[1].id,
      user_id: createdUsers[10].id,
      status: Member_status.KICKED,
    },
    //! event 3
    {
      event_id: createdEvents[2].id,
      user_id: createdUsers[13].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[2].id,
      user_id: createdUsers[12].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[2].id,
      user_id: createdUsers[11].id,
      status: Member_status.LEFT,
    },
    {
      event_id: createdEvents[2].id,
      user_id: createdUsers[4].id,
      status: Member_status.KICKED,
    },
    //! event 4
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[1].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[2].id,
      status: Member_status.LEFT,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[3].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[8].id,
      status: Member_status.KICKED,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[15].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[16].id,
      status: Member_status.LEFT,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[11].id,
      status: Member_status.CONFIRMED,
    },
    {
      event_id: createdEvents[3].id,
      user_id: createdUsers[6].id,
      status: Member_status.KICKED,
    },
  ];

  for (const member of members) {
    const createdMember = await prisma.event_members.create({
      data: member,
    });
    console.log(
      `Added member: User ${member.user_id} to Event ${createdEvents.find((e) => e.id === member.event_id)?.title}`,
    );
  }
}

main()
  .catch((e) => {
    console.error('Main execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding completed. Disconnecting Prisma.');
    await prisma.$disconnect();
  });
