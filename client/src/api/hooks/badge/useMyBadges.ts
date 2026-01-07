import { useQuery } from '@tanstack/react-query';
import BadgeService from '../../services/badgeService';
import type { UserBadge } from '../../../types/badge.type';

export function useMyBadges() {
    return useQuery<UserBadge[]>({
        queryKey: ['myBadges'],
        queryFn: BadgeService.getMyBadges,
    });
}
