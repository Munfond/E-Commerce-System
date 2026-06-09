import { api } from './client';
import { endpoints } from './endpoints';
import type { HttpResponse } from './http';
import { resolveImageUrl } from './imageUrl';
import { AVATAR_BASE_URL } from './config';

export type AdminUserDto = {
  id: string;
  email: string;
};

export type MyAddressDto = {
  id: string;
  label: string;
  receiverName: string;
  receiverPhone: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  details: string;
  isDefault: boolean;
};

type MyAddressRecord = Record<string, unknown>;

export type CreateMyAddressDto = {
  label: string;
  recipient_name: string;
  recipient_phone: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  details: string;
};

type MyAddressesResponse =
  | MyAddressRecord[]
  | MyAddressRecord
  | { data?: MyAddressRecord[] | MyAddressRecord }
  | { items?: MyAddressRecord[] | MyAddressRecord }
  | { status?: string; data?: { data?: MyAddressRecord[] | MyAddressRecord } };

type AdminUsersResponse =
  | AdminUserDto[]
  | AdminUserDto
  | { data?: AdminUserDto[] | AdminUserDto }
  | { items?: AdminUserDto[] | AdminUserDto };

function normalizeAdminUserDto(user: AdminUserDto | Record<string, unknown>): AdminUserDto {
  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
  };
}

function normalizeMyAddressDto(address: MyAddressRecord): MyAddressDto {
  return {
    id: String(address.id ?? ''),
    label: String(address.label ?? address.title ?? address.name ?? ''),
    receiverName: String(address.receiverName ?? address.receiver_name ?? address.name ?? ''),
    receiverPhone: String(address.receiverPhone ?? address.receiver_phone ?? address.phone ?? ''),
    country: String(address.country ?? ''),
    city: String(address.city ?? ''),
    district: String(address.district ?? ''),
    ward: String(address.ward ?? ''),
    details: String(address.details ?? address.address ?? address.full_address ?? ''),
    isDefault: Boolean(address.isDefault ?? address.is_default ?? address.default ?? false),
  };
}

export type UpdateAccountProfileDto = {
  username: string;
  avatar_url: File;
};

export type UpdateAccountProfileResponseDto = {
  status: 'success';
  data: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
  };
};

type UpdateAccountProfileRawResponseDto = {
  status: 'success';
  data: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
  };
};

function normalizeUpdateAccountProfileResponse(
  response: UpdateAccountProfileRawResponseDto
): UpdateAccountProfileResponseDto {
  return {
    status: response.status,
    data: {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      avatarUrl: resolveImageUrl(response.data.avatar_url, AVATAR_BASE_URL),
    },
  };
}

export async function updateAccountProfile(
  payload: UpdateAccountProfileDto
): Promise<HttpResponse<UpdateAccountProfileResponseDto>> {
  const formData = new FormData();
  formData.append('username', payload.username);
  formData.append('avatar_url', payload.avatar_url);

  const res = await api.put<UpdateAccountProfileRawResponseDto>(endpoints.auth.me, formData, { auth: true });

  return {
    ...res,
    data: normalizeUpdateAccountProfileResponse(res.data),
  };
}

export async function getMyAddresses(): Promise<HttpResponse<MyAddressDto[]>> {
  const res = await api.get<MyAddressesResponse>(endpoints.auth.meAddresses, { auth: true });
  const raw = res.data;

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: MyAddressRecord[] }).data)
      ? (raw as { data: MyAddressRecord[] }).data
      : Array.isArray((raw as { items?: MyAddressRecord[] }).items)
        ? (raw as { items: MyAddressRecord[] }).items
        : raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object' && 'data' in raw.data && Array.isArray(raw.data.data)
          ? raw.data.data
          : raw && typeof raw === 'object' && 'id' in raw
            ? [raw as MyAddressRecord]
            : [];

  return {
    ...res,
    data: items.map((item) => normalizeMyAddressDto(item)),
  };
}

type CreateMyAddressResponse =
  | { status?: string; data?: MyAddressRecord }
  | { data?: { status?: string; data?: MyAddressRecord } };

export async function createMyAddress(payload: CreateMyAddressDto): Promise<HttpResponse<MyAddressDto>> {
  const res = await api.post<CreateMyAddressResponse>(endpoints.auth.meAddresses, payload, { auth: true });
  const raw = res.data;
  const record =
    raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object' && 'data' in raw.data
      ? raw.data.data
      : raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object'
        ? raw.data
        : raw && typeof raw === 'object' && 'status' in raw
          ? (raw as { data?: MyAddressRecord }).data ?? {}
          : {};

  return {
    ...res,
    data: normalizeMyAddressDto(record),
  };
}

export async function deleteMyAddress(addressId: string) {
  return api.del<{ success: true }>(`${endpoints.auth.meAddresses}/${addressId}`, { auth: true });
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

type GoogleLoginStartResponse =
  | { url: string }
  | { data?: { url?: string } }
  | { data?: { data?: { url?: string } } };

export async function getGoogleLoginUrl() {
  const res = await api.get<GoogleLoginStartResponse>(endpoints.auth.google, { auth: false });
  const raw = res.data;
  const url =
    'url' in raw && typeof raw.url === 'string'
      ? raw.url
      : 'data' in raw && raw.data && typeof raw.data.url === 'string'
        ? raw.data.url
        : 'data' in raw && raw.data && 'data' in raw.data && typeof raw.data.data?.url === 'string'
          ? raw.data.data.url
          : '';

  return {
    ...res,
    data: { url },
  };
}

type GoogleCallbackResponse =
  | { accessToken?: string; refreshToken?: string; url?: string; redirectUrl?: string }
  | { data?: { accessToken?: string; refreshToken?: string; url?: string; redirectUrl?: string } }
  | { data?: { data?: { accessToken?: string; refreshToken?: string; url?: string; redirectUrl?: string } } };

export async function completeGoogleLogin(payload: Record<string, string>) {
  const res = await api.post<GoogleCallbackResponse>(endpoints.auth.googleCallback, payload, { auth: false });
  const raw = res.data;
  const data =
    'accessToken' in raw || 'refreshToken' in raw || 'url' in raw || 'redirectUrl' in raw
      ? raw
      : 'data' in raw && raw.data && ('accessToken' in raw.data || 'refreshToken' in raw.data || 'url' in raw.data || 'redirectUrl' in raw.data)
        ? raw.data
        : 'data' in raw && raw.data && 'data' in raw.data
          ? raw.data.data
          : undefined;

  return {
    ...res,
    data: {
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      url: data?.url,
      redirectUrl: data?.redirectUrl,
    },
  };
}

export async function getAdminUsers() {
  const res = await api.get<AdminUsersResponse>(endpoints.admin.users, { auth: true });
  const raw = res.data;

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: AdminUserDto[] }).data)
      ? (raw as { data: AdminUserDto[] }).data
      : Array.isArray((raw as { items?: AdminUserDto[] }).items)
        ? (raw as { items: AdminUserDto[] }).items
        : raw && typeof raw === 'object' && 'id' in raw
          ? [raw as AdminUserDto]
          : [];

  return {
    ...res,
    data: items.map((item) => normalizeAdminUserDto(item)),
  };
}
