import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TransitionsService } from './transitions.service';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';

@ApiTags('transitions')
@Controller('transitions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransitionsController {
  constructor(private readonly transitionsService: TransitionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transitions' })
  findAll() {
    return this.transitionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transition by id' })
  findOne(@Param('id') id: string) {
    return this.transitionsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Create transition (HR/Admin only)' })
  create(@Body() createTransitionDto: CreateTransitionDto) {
    return this.transitionsService.create(createTransitionDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Update transition (HR/Admin only)' })
  update(@Param('id') id: string, @Body() updateTransitionDto: UpdateTransitionDto) {
    return this.transitionsService.update(id, updateTransitionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Delete transition (HR/Admin only)' })
  remove(@Param('id') id: string) {
    return this.transitionsService.remove(id);
  }
}

