import type { TemplateId, SlideData, BrandInfo } from '@/lib/types';
import PhotoTemplate from './photo';
import TypoTemplate from './typo';
import EditorialTemplate from './editorial';
import type { ComponentType } from 'react';

export interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, ComponentType<TemplateProps>> = {
  photo: PhotoTemplate,
  typo: TypoTemplate,
  editorial: EditorialTemplate,
};
