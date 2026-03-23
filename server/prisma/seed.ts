import { PrismaClient, UserRole, EyfsArea } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@littleoaks.co.uk' },
    update: {},
    create: {
      email: 'admin@littleoaks.co.uk',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create default rooms
  const rooms = [
    { name: 'Baby Room', ageGroupMin: 0, ageGroupMax: 12, capacity: 9, ratioRequired: '1:3' },
    { name: 'Toddler Room', ageGroupMin: 12, ageGroupMax: 24, capacity: 12, ratioRequired: '1:4' },
    { name: 'Pre-School Room', ageGroupMin: 24, ageGroupMax: 60, capacity: 24, ratioRequired: '1:8' },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: room,
    });
  }
  console.log('Default rooms created');

  // Seed EYFS milestones (Development Matters framework)
  const milestones = [
    // Communication and Language
    { area: EyfsArea.CL, ageRange: '0-11m', description: 'Turns towards a familiar sound', sortOrder: 1 },
    { area: EyfsArea.CL, ageRange: '0-11m', description: 'Reacts to familiar voices', sortOrder: 2 },
    { area: EyfsArea.CL, ageRange: '8-20m', description: 'Understands simple instructions', sortOrder: 3 },
    { area: EyfsArea.CL, ageRange: '8-20m', description: 'Uses single words meaningfully', sortOrder: 4 },
    { area: EyfsArea.CL, ageRange: '16-26m', description: 'Uses up to 50 words', sortOrder: 5 },
    { area: EyfsArea.CL, ageRange: '16-26m', description: 'Begins to put two words together', sortOrder: 6 },
    { area: EyfsArea.CL, ageRange: '22-36m', description: 'Uses simple sentences', sortOrder: 7 },
    { area: EyfsArea.CL, ageRange: '22-36m', description: 'Understands "who", "what", "where" questions', sortOrder: 8 },
    { area: EyfsArea.CL, ageRange: '30-50m', description: 'Uses talk to organise and sequence ideas', sortOrder: 9 },
    { area: EyfsArea.CL, ageRange: '30-50m', description: 'Listens to stories with increasing attention', sortOrder: 10 },
    { area: EyfsArea.CL, ageRange: '40-60m', description: 'Extends vocabulary and groups words together', sortOrder: 11 },
    { area: EyfsArea.CL, ageRange: 'ELG', description: 'Listens attentively and responds with relevant comments and questions', sortOrder: 12 },

    // Physical Development
    { area: EyfsArea.PD, ageRange: '0-11m', description: 'Reaches for and grasps objects', sortOrder: 1 },
    { area: EyfsArea.PD, ageRange: '8-20m', description: 'Walks with help or independently', sortOrder: 2 },
    { area: EyfsArea.PD, ageRange: '16-26m', description: 'Runs safely on whole foot', sortOrder: 3 },
    { area: EyfsArea.PD, ageRange: '22-36m', description: 'Uses large-muscle movements to wave flags and streamers', sortOrder: 4 },
    { area: EyfsArea.PD, ageRange: '30-50m', description: 'Uses one-handed tools and equipment', sortOrder: 5 },
    { area: EyfsArea.PD, ageRange: '30-50m', description: 'Holds pencil with effective grip', sortOrder: 6 },
    { area: EyfsArea.PD, ageRange: '40-60m', description: 'Shows increasing control over an object', sortOrder: 7 },
    { area: EyfsArea.PD, ageRange: 'ELG', description: 'Moves confidently and safely in a range of ways', sortOrder: 8 },

    // Personal, Social and Emotional Development
    { area: EyfsArea.PSED, ageRange: '0-11m', description: 'Shows attachment to key person', sortOrder: 1 },
    { area: EyfsArea.PSED, ageRange: '8-20m', description: 'Explores environment with support of key person', sortOrder: 2 },
    { area: EyfsArea.PSED, ageRange: '16-26m', description: 'Begins to show awareness of own feelings', sortOrder: 3 },
    { area: EyfsArea.PSED, ageRange: '22-36m', description: 'Can play alongside others', sortOrder: 4 },
    { area: EyfsArea.PSED, ageRange: '30-50m', description: 'Initiates play and takes turns', sortOrder: 5 },
    { area: EyfsArea.PSED, ageRange: '40-60m', description: 'Shows confidence in choosing activities', sortOrder: 6 },
    { area: EyfsArea.PSED, ageRange: 'ELG', description: 'Shows sensitivity to others needs and feelings', sortOrder: 7 },

    // Literacy
    { area: EyfsArea.L, ageRange: '16-26m', description: 'Interested in books and rhymes', sortOrder: 1 },
    { area: EyfsArea.L, ageRange: '22-36m', description: 'Has favourite books and seeks them out', sortOrder: 2 },
    { area: EyfsArea.L, ageRange: '30-50m', description: 'Recognises familiar words and signs', sortOrder: 3 },
    { area: EyfsArea.L, ageRange: '30-50m', description: 'Gives meaning to marks as they draw and paint', sortOrder: 4 },
    { area: EyfsArea.L, ageRange: '40-60m', description: 'Links sounds to letters', sortOrder: 5 },
    { area: EyfsArea.L, ageRange: '40-60m', description: 'Begins to read simple words', sortOrder: 6 },
    { area: EyfsArea.L, ageRange: 'ELG', description: 'Reads and understands simple sentences', sortOrder: 7 },
    { area: EyfsArea.L, ageRange: 'ELG', description: 'Uses phonic knowledge to write words', sortOrder: 8 },

    // Mathematics
    { area: EyfsArea.M, ageRange: '16-26m', description: 'Develops an awareness of number names', sortOrder: 1 },
    { area: EyfsArea.M, ageRange: '22-36m', description: 'Recites some number names in sequence', sortOrder: 2 },
    { area: EyfsArea.M, ageRange: '30-50m', description: 'Recognises numerals 1-5', sortOrder: 3 },
    { area: EyfsArea.M, ageRange: '30-50m', description: 'Uses positional language', sortOrder: 4 },
    { area: EyfsArea.M, ageRange: '40-60m', description: 'Counts reliably with numbers from 1-20', sortOrder: 5 },
    { area: EyfsArea.M, ageRange: '40-60m', description: 'Uses everyday language related to money', sortOrder: 6 },
    { area: EyfsArea.M, ageRange: 'ELG', description: 'Adds and subtracts two single-digit numbers', sortOrder: 7 },

    // Understanding the World
    { area: EyfsArea.UW, ageRange: '8-20m', description: 'Explores objects by linking senses', sortOrder: 1 },
    { area: EyfsArea.UW, ageRange: '16-26m', description: 'Explores and experiments with a range of media', sortOrder: 2 },
    { area: EyfsArea.UW, ageRange: '22-36m', description: 'Notices differences between features of the local environment', sortOrder: 3 },
    { area: EyfsArea.UW, ageRange: '30-50m', description: 'Shows interest in technological toys', sortOrder: 4 },
    { area: EyfsArea.UW, ageRange: '30-50m', description: 'Talks about past and present events in own life', sortOrder: 5 },
    { area: EyfsArea.UW, ageRange: '40-60m', description: 'Looks closely at similarities and differences', sortOrder: 6 },
    { area: EyfsArea.UW, ageRange: 'ELG', description: 'Knows about similarities and differences in relation to living things', sortOrder: 7 },

    // Expressive Arts and Design
    { area: EyfsArea.EAD, ageRange: '8-20m', description: 'Explores and experiments with a range of media', sortOrder: 1 },
    { area: EyfsArea.EAD, ageRange: '16-26m', description: 'Beginning to make believe by pretending', sortOrder: 2 },
    { area: EyfsArea.EAD, ageRange: '22-36m', description: 'Creates simple representations of events and objects', sortOrder: 3 },
    { area: EyfsArea.EAD, ageRange: '30-50m', description: 'Constructs with a purpose in mind', sortOrder: 4 },
    { area: EyfsArea.EAD, ageRange: '30-50m', description: 'Explores colour and how colours can be changed', sortOrder: 5 },
    { area: EyfsArea.EAD, ageRange: '40-60m', description: 'Introduces a storyline into their play', sortOrder: 6 },
    { area: EyfsArea.EAD, ageRange: 'ELG', description: 'Safely uses and explores a variety of materials, tools and techniques', sortOrder: 7 },
  ];

  for (const milestone of milestones) {
    await prisma.eyfsMilestone.create({ data: milestone });
  }
  console.log(`${milestones.length} EYFS milestones seeded`);

  // Nursery settings
  const settings = [
    { key: 'nursery_name', value: 'Little Oaks Nursery', description: 'Nursery display name' },
    { key: 'nursery_phone', value: '', description: 'Main nursery phone number' },
    { key: 'nursery_email', value: '', description: 'Main nursery email' },
    { key: 'nursery_address', value: '', description: 'Nursery address' },
    { key: 'ofsted_number', value: '', description: 'Ofsted registration number' },
    { key: 'invoice_prefix', value: 'INV', description: 'Invoice number prefix' },
    { key: 'invoice_next_number', value: '1', description: 'Next invoice sequence number' },
  ];

  for (const setting of settings) {
    await prisma.nurserySetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('Nursery settings seeded');

  console.log('\nSeed complete!');
  console.log('Admin login: admin@littleoaks.co.uk / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
