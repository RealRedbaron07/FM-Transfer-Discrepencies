import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class ESPNScraper {
    private final HttpClient httpClient;
    
    public ESPNScraper() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }
    
    public List<Transfer> scrapeTransfers() {
        List<Transfer> transfers = new ArrayList<>();
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.espn.com/soccer/transfers"))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, 
                HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                System.err.println("HTTP Error: " + response.statusCode());
                return transfers;
            }

            String html = response.body();
            transfers = parseTransfers(html);
            
        } catch (Exception e) {
            System.err.println("Error scraping transfers: " + e.getMessage());
        }
        
        return transfers;
    }
    
    private List<Transfer> parseTransfers(String html) {
        List<Transfer> transfers = new ArrayList<>();
        
        // Pattern to match transfer information
        Pattern transferPattern = Pattern.compile(
            "([A-Za-z\\s'.-]+)\\s+(?:joins|moves to|signs for)\\s+([A-Za-z\\s&.-]+)",
            Pattern.CASE_INSENSITIVE
        );
        
        Matcher matcher = transferPattern.matcher(html);
        int count = 0;
        
        while (matcher.find() && count < 10) {
            String playerName = cleanText(matcher.group(1));
            String toClub = cleanText(matcher.group(2));
            
            if (isValidTransfer(playerName, toClub)) {
                // Create a basic player and transfer object
                Player player = new Player(playerName, 25, "Unknown", 150, 160, 3, 12);
                Transfer transfer = new Transfer(
                    player, "Unknown", toClub, 
                    generateEstimatedFee(), 1, "AI", LocalDate.now()
                );
                transfers.add(transfer);
                count++;
            }
        }
        
        return transfers;
    }
    
    private String cleanText(String text) {
        return text.trim().replaceAll("\\s+", " ");
    }
    
    private boolean isValidTransfer(String playerName, String club) {
        return !playerName.isEmpty() && !club.isEmpty() && 
               playerName.length() > 2 && club.length() > 2;
    }
    
    private double generateEstimatedFee() {
        Random random = new Random();
        return (random.nextDouble() * 50 + 5) * 1_000_000; // 5M to 55M
    }
}
