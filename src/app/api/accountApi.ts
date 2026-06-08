import { api } from './client';
import { endpoints } from './endpoints';

export type UpdateAccountProfileDto = {
  fullName: string;
  avatarUrl: string;
};

export type UpdateAccountProfileResponseDto = {
  fullName: string;
  avatarUrl: string;
};

export async function updateAccountProfile(payload: UpdateAccountProfileDto) {
  return api.put<UpdateAccountProfileResponseDto>(endpoints.auth.me, payload, { auth: true });
}

export type ChangeAccountPasswordDto = {
  newPassword: string;
};

export type ChangeAccountPasswordResponseDto = {
  success: true;
};

export async function changeAccountPassword(payload: ChangeAccountPasswordDto) {
  return api.put<ChangeAccountPasswordResponseDto>(endpoints.auth.password, payload, { auth: true });
}
