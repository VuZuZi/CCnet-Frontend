import { useQuery } from '@tanstack/react-query';
import { evidenceAPI } from '../api/evidence.api';
import { EVIDENCE_QUERY_KEYS } from '../constants/evidence.queryKeys';

export const usePublicEvidence = (projectId, milestoneId) => {
    return useQuery({
        queryKey: EVIDENCE_QUERY_KEYS.public(projectId, milestoneId),
        queryFn: () => evidenceAPI.getPublicEvidence(projectId, milestoneId),
        enabled: Boolean(projectId && milestoneId),
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyEvidenceList = (filters = {}) => {
    return useQuery({
        queryKey: EVIDENCE_QUERY_KEYS.list(filters),
        queryFn: () => evidenceAPI.getMyEvidence(filters),
    });
};

export const useEvidenceDetail = (id) => {
    return useQuery({
        queryKey: EVIDENCE_QUERY_KEYS.detail(id),
        queryFn: () => evidenceAPI.getEvidenceDetail(id),
        enabled: Boolean(id),
    });
};

export const useAdminEvidenceList = (filters = {}) => {
    return useQuery({
        queryKey: [...EVIDENCE_QUERY_KEYS.all, 'admin-list', filters],
        queryFn: () => evidenceAPI.getAdminEvidenceList(filters),
        staleTime: 30000,
    });
};