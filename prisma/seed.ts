// prisma/seed.ts
import { Event_visibility, PrismaClient, Sex } from '@prisma/client';
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
      image_url: 'https://DZZKVZVDV.com',
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
      image_url: 'https://yugi-image.com',
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
      image_url: 'https://joey-image.com',
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
      max_participants: 50,
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
      max_participants: 200,
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
      max_participants: 20,
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
      creator_id: createdUsers[0].id,
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
      creator_id: createdUsers[1].id,
    },
  ];

  // Créer les events
  for (const event of events) {
    const createdEvent = await prisma.events.create({
      data: event,
    });
    console.log(`Created event: ${event.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
