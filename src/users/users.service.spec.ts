import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt');
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const dto: CreateUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('create', () => {
    it('hashes the password and saves the user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      const mockUser = {
        ...dto,
        id: 1,
        password: 'hashed_password',
        save: jest.fn(),
      } as unknown as User;
      (mockUser.save as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(User, 'create').mockReturnValue(mockUser);

      await service.create(dto);

      expect(User.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed_password',
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('throws ConflictException when email already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1 } as User);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      const user = { id: 1, email: 'john@example.com' } as User;
      jest.spyOn(User, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
