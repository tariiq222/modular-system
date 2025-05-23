import { Controller, Get, Query, UseGuards, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { UserRole } from '../modules/users/entities/user.entity';
import { ErrorLoggerService } from '../shared/utils';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('logs')
@Controller('admin/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ErrorLogsController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  @Get()
  @ApiOperation({ summary: 'u0627u0644u062du0635u0648u0644 u0639u0644u0649 u0622u062eu0631 u0633u062cu0644u0627u062a u0627u0644u0623u062eu0637u0627u0621' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0633u062au0631u062cu0627u0639 u0633u062cu0644u0627u062a u0627u0644u0623u062eu0637u0627u0621 u0628u0646u062cu0627u062d' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'u0639u062fu062f u0627u0644u0623u062eu0637u0627u0621 u0627u0644u0645u0637u0644u0648u0628u0629' })
  getLatestErrors(@Query('limit') limit?: number) {
    return this.errorLoggerService.getAllErrorLogs(1, limit ? parseInt(limit.toString(), 10) : 10);
  }

  @Get('search')
  @ApiOperation({ summary: 'u0627u0644u0628u062du062b u0641u064a u0633u062cu0644u0627u062a u0627u0644u0623u062eu0637u0627u0621' })
  @ApiResponse({ status: 200, description: 'u062au0645 u0627u0644u0628u062du062b u0641u064a u0633u062cu0644u0627u062a u0627u0644u0623u062eu0637u0627u0621 u0628u0646u062cu0627u062d' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'u0646u0635 u0627u0644u0628u062du062b' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'u0639u062fu062f u0627u0644u0646u062au0627u0626u062c u0627u0644u0645u0637u0644u0648u0628u0629' })
  searchErrors(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query) {
      return [];
    }
    
    return this.errorLoggerService.searchErrorLogs(
      query,
      limit ? parseInt(limit.toString(), 10) : 50,
    );
  }
}