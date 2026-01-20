import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      password: hashedPassword,
      role: 'HR',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: 'employee@company.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('Created users:', { admin: admin.email, hr: hr.email, employee: employee.email });

  const existingJuniorDev = await prisma.position.findFirst({
    where: { title: 'Junior Developer', department: 'Engineering' },
  });
  const juniorDev = existingJuniorDev || await prisma.position.create({
    data: {
      title: 'Junior Developer',
      level: 1,
      department: 'Engineering',
    },
  });

  const existingMiddleDev = await prisma.position.findFirst({
    where: { title: 'Middle Developer', department: 'Engineering' },
  });
  const middleDev = existingMiddleDev || await prisma.position.create({
    data: {
      title: 'Middle Developer',
      level: 2,
      department: 'Engineering',
    },
  });

  const existingSeniorDev = await prisma.position.findFirst({
    where: { title: 'Senior Developer', department: 'Engineering' },
  });
  const seniorDev = existingSeniorDev || await prisma.position.create({
    data: {
      title: 'Senior Developer',
      level: 3,
      department: 'Engineering',
    },
  });

  const existingTechLead = await prisma.position.findFirst({
    where: { title: 'Tech Lead', department: 'Engineering' },
  });
  const techLead = existingTechLead || await prisma.position.create({
    data: {
      title: 'Tech Lead',
      level: 4,
      department: 'Engineering',
    },
  });

  const existingJuniorDesigner = await prisma.position.findFirst({
    where: { title: 'Junior Designer', department: 'Design' },
  });
  const juniorDesigner = existingJuniorDesigner || await prisma.position.create({
    data: {
      title: 'Junior Designer',
      level: 1,
      department: 'Design',
    },
  });

  const existingMiddleDesigner = await prisma.position.findFirst({
    where: { title: 'Middle Designer', department: 'Design' },
  });
  const middleDesigner = existingMiddleDesigner || await prisma.position.create({
    data: {
      title: 'Middle Designer',
      level: 2,
      department: 'Design',
    },
  });

  const existingPM = await prisma.position.findFirst({
    where: { title: 'Project Manager', department: 'Management' },
  });
  const projectManager = existingPM || await prisma.position.create({
    data: {
      title: 'Project Manager',
      level: 3,
      department: 'Management',
    },
  });

  console.log('Created positions');

  const existingTypescript = await prisma.skill.findFirst({
    where: { name: 'TypeScript' },
  });
  const typescript = existingTypescript || await prisma.skill.create({
    data: {
      name: 'TypeScript',
      category: 'Programming',
    },
  });

  const existingReact = await prisma.skill.findFirst({
    where: { name: 'React' },
  });
  const react = existingReact || await prisma.skill.create({
    data: {
      name: 'React',
      category: 'Frontend',
    },
  });

  const existingNodejs = await prisma.skill.findFirst({
    where: { name: 'Node.js' },
  });
  const nodejs = existingNodejs || await prisma.skill.create({
    data: {
      name: 'Node.js',
      category: 'Backend',
    },
  });

  const existingLeadership = await prisma.skill.findFirst({
    where: { name: 'Leadership' },
  });
  const leadership = existingLeadership || await prisma.skill.create({
    data: {
      name: 'Leadership',
      category: 'Soft Skills',
    },
  });

  const existingFigma = await prisma.skill.findFirst({
    where: { name: 'Figma' },
  });
  const figma = existingFigma || await prisma.skill.create({
    data: {
      name: 'Figma',
      category: 'Design',
    },
  });

  const existingAgile = await prisma.skill.findFirst({
    where: { name: 'Agile Methodology' },
  });
  const agile = existingAgile || await prisma.skill.create({
    data: {
      name: 'Agile Methodology',
      category: 'Management',
    },
  });

  console.log('Created skills');

  const existingTrans1 = await prisma.transition.findFirst({
    where: {
      fromPositionId: juniorDev.id,
      toPositionId: middleDev.id,
    },
  });
  if (!existingTrans1) {
    await prisma.transition.create({
      data: {
        type: 'VERTICAL',
        fromPositionId: juniorDev.id,
        toPositionId: middleDev.id,
        requiredSkills: {
          connect: [{ id: typescript.id }, { id: react.id }],
        },
      },
    });
  }

  const existingTrans2 = await prisma.transition.findFirst({
    where: {
      fromPositionId: middleDev.id,
      toPositionId: seniorDev.id,
    },
  });
  if (!existingTrans2) {
    await prisma.transition.create({
      data: {
        type: 'VERTICAL',
        fromPositionId: middleDev.id,
        toPositionId: seniorDev.id,
        requiredSkills: {
          connect: [{ id: typescript.id }, { id: react.id }, { id: nodejs.id }],
        },
      },
    });
  }

  const existingTrans3 = await prisma.transition.findFirst({
    where: {
      fromPositionId: seniorDev.id,
      toPositionId: techLead.id,
    },
  });
  if (!existingTrans3) {
    await prisma.transition.create({
      data: {
        type: 'VERTICAL',
        fromPositionId: seniorDev.id,
        toPositionId: techLead.id,
        requiredSkills: {
          connect: [{ id: leadership.id }],
        },
      },
    });
  }

  const existingTrans4 = await prisma.transition.findFirst({
    where: {
      fromPositionId: juniorDesigner.id,
      toPositionId: middleDesigner.id,
    },
  });
  if (!existingTrans4) {
    await prisma.transition.create({
      data: {
        type: 'VERTICAL',
        fromPositionId: juniorDesigner.id,
        toPositionId: middleDesigner.id,
        requiredSkills: {
          connect: [{ id: figma.id }],
        },
      },
    });
  }

  const existingTrans5 = await prisma.transition.findFirst({
    where: {
      fromPositionId: middleDev.id,
      toPositionId: projectManager.id,
    },
  });
  if (!existingTrans5) {
    await prisma.transition.create({
      data: {
        type: 'CHANGE',
        fromPositionId: middleDev.id,
        toPositionId: projectManager.id,
        requiredSkills: {
          connect: [{ id: agile.id }],
        },
      },
    });
  }

  const existingTrans6 = await prisma.transition.findFirst({
    where: {
      fromPositionId: middleDesigner.id,
      toPositionId: projectManager.id,
    },
  });
  if (!existingTrans6) {
    await prisma.transition.create({
      data: {
        type: 'CHANGE',
        fromPositionId: middleDesigner.id,
        toPositionId: projectManager.id,
        requiredSkills: {
          connect: [{ id: agile.id }],
        },
      },
    });
  }

  const existingTrans7 = await prisma.transition.findFirst({
    where: {
      fromPositionId: juniorDev.id,
      toPositionId: juniorDesigner.id,
    },
  });
  if (!existingTrans7) {
    await prisma.transition.create({
      data: {
        type: 'HORIZONTAL',
        fromPositionId: juniorDev.id,
        toPositionId: juniorDesigner.id,
        requiredSkills: {
          connect: [{ id: figma.id }],
        },
      },
    });
  }

  await prisma.user.update({
    where: { id: employee.id },
    data: { positionId: juniorDev.id },
  });

  console.log('Created transitions');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

