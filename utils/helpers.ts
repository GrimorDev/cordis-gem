import { User, Server } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const triggerFileInput = (inputId: string) => {
  const element = document.getElementById(inputId);
  if (element) element.click();
};

/**
 * Zwraca kolor najwyższej roli użytkownika na serwerze, która ma ustawiony kolor.
 */
export const getUserRoleColor = (user: User, server?: Server): string | undefined => {
  if (!server || !user.roleIds || user.roleIds.length === 0) return undefined;
  
  // Znajdź wszystkie role użytkownika
  const userRoles = server.roles
    .filter(role => user.roleIds?.includes(role.id))
    .sort((a, b) => a.position - b.position); // Niższa pozycja = wyższa ranga w naszym modelu (Admin=0)

  // Zwróć kolor pierwszej roli, która nie jest kolorem domyślnym (opcjonalnie)
  // W Discordzie domyślny kolor to często #99aab5 lub transparentny
  const coloredRole = userRoles.find(role => role.color && role.color !== '#94a3b8' && role.color !== '#99aab5');
  
  return coloredRole?.color;
};
