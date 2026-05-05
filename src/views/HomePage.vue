<script setup>
import { useLandingContent } from '@/app/content/landingContent';
import AppFooter from '@/components/layout/AppFooter.vue';
import {
  AuditSection,
  ChecklistSection,
  FreeServicesSection,
  HeroSection,
  IdeaSection,
  ImportantSection,
  OfferSection,
  ReviewsSection,
  UsefulSection
} from '@/components/sections';

const { landingData } = useLandingContent();
</script>

<template>
  <main class="page-shell">
    <HeroSection
      :brand="landingData.brand"
      :navigation="landingData.navigation"
      :header-content="landingData.headerContent"
      :hero-content="landingData.heroContent"
    />
    <IdeaSection :idea-section="landingData.ideaSection" />
    <OfferSection
      :offer-meta="landingData.offerMeta"
      :offer-cards="landingData.offerCards"
    />
    <FreeServicesSection
      :title="landingData.freeServicesSection.title"
      :forms="landingData.freeServiceForms"
    />
    <ChecklistSection :checklist-content="landingData.checklistContent" />
    <AuditSection :dual-section="landingData.dualSection" />
    <ImportantSection :important-section="landingData.importantSection" />
    <UsefulSection :useful-section="landingData.usefulSection" />
    <ReviewsSection
      :section-content="landingData.reviewsSection"
      :reviews="landingData.reviews"
    />
  </main>

  <AppFooter
    :brand="landingData.brand"
    :footer-groups="landingData.footerGroups"
    :footer-content="landingData.footerContent"
  />
</template>
